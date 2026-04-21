import { getPurchaseOrders } from "./purchaseOrders";
import { getRequisitions } from "./requisitions";
import { getBudgets } from "./budgets";
import { PurchaseOrder, Requisition, Budget, DashboardEvent, AppUser } from "@/types";
import { getExchangeRates, convertCurrency } from "./exchangeRates";

export interface SpendSummary {
    totalSpend: number;
    pendingSpend: number;
    savings: number;
    avgApprovalDays: number;
    spendByDepartment: Record<string, number>;
    spendByVendor: Record<string, number>;
    spendByCategory: Record<string, number>;
    monthlySpend: { label: string; value: number }[];
    budgetUsage: { total: number; used: number; percent: number };
    recentTransactions: any[];
    activityFeed: DashboardEvent[];
    baseCurrency: string;
    carbonFootprint: {
        totalCo2e: number;
        byDepartment: Record<string, number>;
    };
}

export const getSpendAnalytics = async (user: AppUser, targetCurrency: string = 'USD'): Promise<SpendSummary> => {
    const [posData, reqsData, budgetsData, rates] = await Promise.all([
        getPurchaseOrders(user),
        getRequisitions(user),
        getBudgets(user),
        getExchangeRates()
    ]);

    const pos = posData || [];
    const reqs = reqsData || [];
    const budgets = budgetsData || [];

    const reqMap = new Map(reqs.filter(r => r?.id).map(r => [r.id!, r]));

    const summary: SpendSummary = {
        totalSpend: 0,
        pendingSpend: 0,
        savings: 0,
        avgApprovalDays: 0,
        spendByDepartment: {},
        spendByVendor: {},
        spendByCategory: {},
        monthlySpend: [],
        budgetUsage: { total: 0, used: 0, percent: 0 },
        recentTransactions: [],
        activityFeed: [],
        baseCurrency: targetCurrency,
        carbonFootprint: { totalCo2e: 0, byDepartment: {} }
    };

    // 1. Calculate Budget Usage (with conversion)
    summary.budgetUsage.total = budgets.reduce((acc, b) => {
        const amount = Number(b.amount) || 0;
        const converted = convertCurrency(amount, b.currency || 'USD', targetCurrency, rates);
        return acc + converted;
    }, 0);

    // 2. Prepare Trend Tracking (Last 6 Months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const trendMap = new Map<string, number>();

    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(currentMonth - i);
        trendMap.set(months[d.getMonth()], 0);
    }

    let approvalTotalDays = 0;
    let approvedCount = 0;

    pos.forEach(po => {
        const amountRaw = Number(po.totalAmount) || 0;
        const amount = convertCurrency(amountRaw, po.currency || 'USD', targetCurrency, rates);

        if (po.status !== 'CLOSED' && po.status !== 'CANCELLED') {
            summary.totalSpend += amount;
            summary.budgetUsage.used += amount;
        }

        const vendor = po.vendorName || 'Unknown';
        summary.spendByVendor[vendor] = (summary.spendByVendor[vendor] || 0) + amount;

        const req = reqMap.get(po.requisitionId);
        if (req) {
            const dept = req.department || 'Unassigned';
            summary.spendByDepartment[dept] = (summary.spendByDepartment[dept] || 0) + amount;

            // Calculate Category Distribution from items
            req.items?.forEach(item => {
                const itemTotalRaw = Number(item.total) || 0;
                const itemTotal = convertCurrency(itemTotalRaw, req.currency || 'USD', targetCurrency, rates);

                const desc = item.description?.toLowerCase() ?? '';
                const category = desc.includes('it') ? 'IT Hardware' :
                    desc.includes('office') ? 'Office Supplies' :
                    desc.includes('software') ? 'Software Subs' :
                            dept;
                summary.spendByCategory[category] = (summary.spendByCategory[category] || 0) + itemTotal;
            });

            // Calculate Approval Time
            if (po.issuedAt && req.createdAt) {
                const delta = (new Date(po.issuedAt).getTime() - new Date(req.createdAt).getTime()) / (1000 * 3600 * 24);
                if (delta > 0) {
                    approvalTotalDays += delta;
                    approvedCount++;
                }
            }

            // Calculate Carbon Footprint (Phase 7 realization)
            req.items?.forEach(item => {
                const itemCo2e = (item as any).co2e || (1.5 * Number(item.quantity) || 0); // Default factor
                summary.carbonFootprint.totalCo2e += itemCo2e;
                summary.carbonFootprint.byDepartment[dept] = (summary.carbonFootprint.byDepartment[dept] || 0) + itemCo2e;
            });
        }

        // Add to Trend Map
        const poDate = new Date(po.issuedAt || Date.now());
        const poMonth = months[poDate.getMonth()];
        if (poMonth && trendMap.has(poMonth)) {
            trendMap.set(poMonth, (trendMap.get(poMonth) || 0) + amount);
        }

        // PRODUCTION REALIZATION: Real Savings Calculation
        // Compare Requisition Estimate vs Final PO Amount
        if (req) {
            const reqAmount = convertCurrency(req.totalAmount, req.currency || 'USD', targetCurrency, rates);
            const poAmount = amount;

            // If the PO is cheaper than requested, it's a "Savings" (negotiation or better sourcing)
            if (reqAmount > poAmount) {
                summary.savings += (reqAmount - poAmount);
            }
        }

        // Standard Order Event
        summary.activityFeed.push({
            id: po.id!,
            type: 'ORDER',
            title: `PO ${po.poNumber} Issued`,
            description: `Order issued to ${po.vendorName}`,
            amount: amount,
            currency: targetCurrency,
            timestamp: po.issuedAt,
            user: 'System',
            status: po.status
        });
    });

    // Finalize KPIs
    summary.avgApprovalDays = approvedCount > 0 ? Number((approvalTotalDays / approvedCount).toFixed(1)) : 0;
    summary.monthlySpend = Array.from(trendMap.entries()).map(([label, value]) => ({ label, value }));
    summary.budgetUsage.percent = summary.budgetUsage.total > 0 ? (summary.budgetUsage.used / summary.budgetUsage.total) * 100 : 0;

    // Add Pending Requisitions to Feed (with conversion)
    reqs.filter(r => r.status === 'PENDING').slice(0, 5).forEach(req => {
        const reqAmount = convertCurrency(req.totalAmount, req.currency || 'USD', targetCurrency, rates);
        summary.activityFeed.push({
            id: req.id!,
            type: 'REQUISITION',
            title: 'New Requisition',
            description: `${req.requesterName} requested ${req.items?.[0]?.description ?? 'items'}`,
            amount: reqAmount,
            currency: targetCurrency,
            timestamp: req.createdAt,
            user: req.requesterName,
            status: req.status
        });
    });

    summary.recentTransactions = pos
        .sort((a, b) => {
            const timeA = a.issuedAt instanceof Date ? a.issuedAt.getTime() : new Date(a.issuedAt || 0).getTime();
            const timeB = b.issuedAt instanceof Date ? b.issuedAt.getTime() : new Date(b.issuedAt || 0).getTime();
            return timeB - timeA;
        })
        .map(po => ({
            ...po,
            totalAmount: convertCurrency(po.totalAmount, po.currency || 'USD', targetCurrency, rates),
            currency: targetCurrency
        }))
        .slice(0, 5);

    summary.activityFeed.sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp || 0).getTime();
        const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
    });

    return summary;
};
