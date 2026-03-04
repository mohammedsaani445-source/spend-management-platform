import { PurchaseOrder, Vendor, AppUser } from "@/types";
import { getPurchaseOrders } from "./purchaseOrders";
import { getVendors } from "./vendors";

export interface VendorPerformance {
    vendorId: string;
    vendorName: string;
    totalSpend: number;
    totalOrders: number;
    onTimeOrders: number;
    reliabilityScore: number; // 0-100
    avgDelayDays: number;
    rank?: number; // 1 = Best
}

export const getVendorPerformanceAnalytics = async (user: AppUser): Promise<VendorPerformance[]> => {
    try {
        const tenantId = user.tenantId;
        const [allPOs, allVendors] = await Promise.all([
            getPurchaseOrders(user),
            getVendors(tenantId)
        ]);

        // Group POs by Vendor
        const vendorStats: Record<string, { totalSpend: number, totalOrders: number, onTimeOrders: number, totalDelay: number, closedCount: number }> = {};

        // Initialize with all vendors (even those with no orders)
        allVendors.forEach(v => {
            if (v.id) {
                vendorStats[v.id] = { totalSpend: 0, totalOrders: 0, onTimeOrders: 0, totalDelay: 0, closedCount: 0 };
            }
        });

        allPOs.forEach(po => {
            if (!po.vendorId || !vendorStats[po.vendorId]) return;

            const stats = vendorStats[po.vendorId];
            stats.totalSpend += po.totalAmount;
            stats.totalOrders += 1;

            if ((po.status === 'RECEIVED' || po.status === 'FULFILLED' || po.status === 'CLOSED') && po.receivedAt && po.expectedDeliveryDate) {
                stats.closedCount++;
                const received = new Date(po.receivedAt).getTime();
                const expected = new Date(po.expectedDeliveryDate).getTime();
                const diffTime = received - expected;
                const diffDays = diffTime / (1000 * 60 * 60 * 24);

                stats.totalDelay += diffDays;

                if (diffDays <= 1) {
                    stats.onTimeOrders++;
                }
            }
        });

        const results: VendorPerformance[] = allVendors.map(v => {
            const stats = vendorStats[v.id!] || { totalSpend: 0, totalOrders: 0, onTimeOrders: 0, totalDelay: 0, closedCount: 0 };

            let reliability = 100;
            let avgDelay = 0;

            if (stats.closedCount > 0) {
                reliability = (stats.onTimeOrders / stats.closedCount) * 100;
                avgDelay = stats.totalDelay / stats.closedCount;
            }

            return {
                vendorId: v.id!,
                vendorName: v.name,
                totalSpend: stats.totalSpend,
                totalOrders: stats.totalOrders,
                onTimeOrders: stats.onTimeOrders,
                reliabilityScore: Math.round(reliability),
                avgDelayDays: parseFloat(avgDelay.toFixed(1))
            };
        });

        const maxSpend = Math.max(...results.map(r => r.totalSpend), 1);

        const refinedResults = results.map(r => {
            const volumeScore = (r.totalSpend / maxSpend) * 100;
            const weightedScore = (r.reliabilityScore * 0.7) + (volumeScore * 0.3);

            return {
                ...r,
                reliabilityScore: Math.round(weightedScore)
            };
        });

        return refinedResults.sort((a, b) => b.reliabilityScore - a.reliabilityScore)
            .map((item, index) => ({ ...item, rank: index + 1 }));

    } catch (error) {
        console.error("Error calculating vendor analytics", error);
        return [];
    }
};
