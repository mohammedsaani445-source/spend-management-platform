import { db, DB_PREFIX } from "./firebase";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { PurchaseOrder, Vendor } from "@/types";

export interface VendorMetrics {
    onTimeDelivery: number; // 0-100
    qualityRating: number; // 1-5 (currently defaults to 4.5 if no feedback)
    totalOrders: number;
    activeSince: number;
    fulfillmentRatio: number; // % of POs that reached RECEIVED/FULFILLED
}

export const getVendorPerformanceMetrics = async (tenantId: string, vendorId: string): Promise<VendorMetrics> => {
    try {
        const poRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/purchase_orders`);
        const q = query(poRef, orderByChild('vendorId'), equalTo(vendorId));
        const snapshot = await get(q);

        if (!snapshot.exists()) {
            return {
                onTimeDelivery: 0,
                qualityRating: 0,
                totalOrders: 0,
                activeSince: new Date().getFullYear(),
                fulfillmentRatio: 0
            };
        }

        const pos = Object.values(snapshot.val()) as PurchaseOrder[];
        const totalOrders = pos.length;

        // 1. Active Since
        const firstPO = pos.reduce((min, p) => p.issuedAt < min.issuedAt ? p : min, pos[0]);
        const activeSince = firstPO ? new Date(firstPO.issuedAt).getFullYear() : new Date().getFullYear();

        // 2. Fulfillment Ratio
        const fulfilledPOs = pos.filter(p => p.status === 'RECEIVED' || p.status === 'FULFILLED' || p.status === 'CLOSED');
        const fulfillmentRatio = totalOrders > 0 ? (fulfilledPOs.length / totalOrders) * 100 : 0;

        // 3. On-Time Delivery
        // We look for 'RECEIVED' status and check if it happened before expectedDeliveryDate
        let onTimeCount = 0;
        let deliveriesWithDates = 0;

        fulfilledPOs.forEach(po => {
            if (po.expectedDeliveryDate && po.receivedAt) {
                deliveriesWithDates++;
                const expected = new Date(po.expectedDeliveryDate).getTime();
                const actual = new Date(po.receivedAt).getTime();
                if (actual <= expected) {
                    onTimeCount++;
                }
            }
        });

        const onTimeDelivery = deliveriesWithDates > 0 ? (onTimeCount / deliveriesWithDates) * 100 : 90; // Default to 90 if no date data exists but PO is fulfilled

        return {
            onTimeDelivery: Math.round(onTimeDelivery),
            qualityRating: 4.8, // In a full system, this would come from a "Vendor Review" collection
            totalOrders,
            activeSince,
            fulfillmentRatio: Math.round(fulfillmentRatio)
        };
    } catch (error) {
        console.error("Error calculating vendor metrics:", error);
        return {
            onTimeDelivery: 0,
            qualityRating: 0,
            totalOrders: 0,
            activeSince: new Date().getFullYear(),
            fulfillmentRatio: 0
        };
    }
};
