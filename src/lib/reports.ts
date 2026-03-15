import { db, DB_PREFIX } from "./firebase";
import { ref, get } from "firebase/database";
import { Bill, Invoice, Budget, PurchaseOrder, Vendor, PaymentRun } from "@/types";

// ── Types ────────────────────────────────────────────────────────────────────

export interface DateRange {
    start: string; // ISO date
    end: string;
}

export interface SpendSummary {
    totalSpend: number;
    byDepartment: Record<string, number>;
    byVendor: Record<string, number>;
    byMonth: { month: string; amount: number }[];
    invoiceCount: number;
    averageInvoice: number;
    currency: string;
}

export interface AgingBucket {
    label: string;
    range: string;
    count: number;
    amount: number;
    percentage: number;
    bills: { vendor: string; invoice: string; amount: number; daysOverdue: number }[];
}

export interface AgingReport {
    buckets: AgingBucket[];
    totalOutstanding: number;
    totalCount: number;
    currency: string;
}

export interface VendorPerformanceRow {
    vendorId: string;
    vendorName: string;
    totalSpend: number;
    invoiceCount: number;
    poCount: number;
    onTimeRate: number;       // 0-100
    averagePayDays: number;
    performanceScore: number; // 0-100
    status: string;
}

export interface BudgetVsActualRow {
    department: string;
    budgetAmount: number;
    actualSpend: number;
    committedAmount: number; // 🛡️ Phase 58
    totalutilized: number;  // actual + committed
    variance: number;
    variancePercent: number;
    status: 'UNDER' | 'ON_TRACK' | 'OVER';
    currency: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const toDate = (d: any): Date => {
    if (!d) return new Date(0);
    if (d instanceof Date) return d;
    if (typeof d === 'object' && d.seconds) return new Date(d.seconds * 1000);
    return new Date(d);
};

const isInRange = (date: any, range?: DateRange): boolean => {
    if (!range) return true;
    const d = toDate(date);
    return d >= new Date(range.start) && d <= new Date(range.end + 'T23:59:59');
};

const getMonthKey = (date: any): string => {
    const d = toDate(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// ── Data Fetchers ────────────────────────────────────────────────────────────

const fetchCollection = async <T>(tenantId: string, collection: string): Promise<T[]> => {
    const snap = await get(ref(db, `${DB_PREFIX}/tenants/${tenantId}/${collection}`));
    if (!snap.exists()) return [];
    const data = snap.val();
    return Object.entries(data).map(([id, val]: [string, any]) => ({ ...val, id }));
};

// ── Report Generators ────────────────────────────────────────────────────────

/**
 * Spend Summary: total spend by department, vendor, month
 */
export const generateSpendSummary = async (
    tenantId: string,
    range?: DateRange,
    departmentFilter?: string
): Promise<SpendSummary> => {
    const invoices = await fetchCollection<Invoice>(tenantId, 'invoices');

    const filtered = invoices.filter(inv => {
        if (!['APPROVED', 'PAID'].includes(inv.status)) return false;
        if (!isInRange(inv.issueDate, range)) return false;
        if (departmentFilter && departmentFilter !== 'ALL' && inv.department !== departmentFilter) return false;
        return true;
    });

    const byDepartment: Record<string, number> = {};
    const byVendor: Record<string, number> = {};
    const byMonthMap: Record<string, number> = {};
    let totalSpend = 0;

    for (const inv of filtered) {
        const amount = Number(inv.amount) || 0;
        totalSpend += amount;

        const dept = inv.department || 'Unassigned';
        byDepartment[dept] = (byDepartment[dept] || 0) + amount;

        const vendor = inv.vendorName || 'Unknown';
        byVendor[vendor] = (byVendor[vendor] || 0) + amount;

        const month = getMonthKey(inv.issueDate);
        byMonthMap[month] = (byMonthMap[month] || 0) + amount;
    }

    const byMonth = Object.entries(byMonthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({ month, amount }));

    return {
        totalSpend,
        byDepartment,
        byVendor,
        byMonth,
        invoiceCount: filtered.length,
        averageInvoice: filtered.length > 0 ? totalSpend / filtered.length : 0,
        currency: 'USD',
    };
};

/**
 * Payment Aging: outstanding bills in 0-30, 31-60, 61-90, 90+ buckets
 */
export const generateAgingReport = async (tenantId: string): Promise<AgingReport> => {
    const bills = await fetchCollection<Bill>(tenantId, 'bills');
    const outstanding = bills.filter(b => ['UNPAID', 'SCHEDULED'].includes(b.status));

    const today = new Date();
    const bucketDefs = [
        { label: 'Current', range: '0–30 days', min: 0, max: 30 },
        { label: '31–60', range: '31–60 days', min: 31, max: 60 },
        { label: '61–90', range: '61–90 days', min: 61, max: 90 },
        { label: '90+', range: '90+ days', min: 91, max: Infinity },
    ];

    const totalOutstanding = outstanding.reduce((s, b) => s + (Number(b.amount) || 0), 0);

    const buckets: AgingBucket[] = bucketDefs.map(def => {
        const matched = outstanding.filter(b => {
            const daysOverdue = Math.floor((today.getTime() - toDate(b.dueDate).getTime()) / 86400000);
            return daysOverdue >= def.min && daysOverdue <= def.max;
        });

        const amount = matched.reduce((s, b) => s + (Number(b.amount) || 0), 0);

        return {
            label: def.label,
            range: def.range,
            count: matched.length,
            amount,
            percentage: totalOutstanding > 0 ? (amount / totalOutstanding) * 100 : 0,
            bills: matched.map(b => ({
                vendor: b.vendorName,
                invoice: b.invoiceNumber,
                amount: Number(b.amount) || 0,
                daysOverdue: Math.floor((today.getTime() - toDate(b.dueDate).getTime()) / 86400000),
            })),
        };
    });

    return {
        buckets,
        totalOutstanding,
        totalCount: outstanding.length,
        currency: 'USD',
    };
};

/**
 * Vendor Performance: spend, delivery, scores per vendor
 */
export const generateVendorPerformance = async (
    tenantId: string,
    range?: DateRange
): Promise<VendorPerformanceRow[]> => {
    const [vendors, invoices, pos] = await Promise.all([
        fetchCollection<Vendor>(tenantId, 'vendors'),
        fetchCollection<Invoice>(tenantId, 'invoices'),
        fetchCollection<PurchaseOrder>(tenantId, 'purchase_orders'),
    ]);

    return vendors.map(vendor => {
        const vInvoices = invoices.filter(i =>
            i.vendorId === vendor.id &&
            ['APPROVED', 'PAID'].includes(i.status) &&
            isInRange(i.issueDate, range)
        );
        const vPOs = pos.filter(p => p.vendorId === vendor.id);

        const totalSpend = vInvoices.reduce((s, i) => s + (Number(i.amount) || 0), 0);

        // Calculate average payment days from issue to payment
        const payDays = vInvoices
            .filter(i => i.status === 'PAID')
            .map(i => {
                const issue = toDate(i.issueDate).getTime();
                const due = toDate(i.dueDate).getTime();
                return Math.floor((due - issue) / 86400000);
            });
        const averagePayDays = payDays.length > 0
            ? Math.round(payDays.reduce((s, d) => s + d, 0) / payDays.length)
            : 0;

        // On-time rate from PO delivery
        const deliveredPOs = vPOs.filter(p =>
            ['RECEIVED', 'DELIVERED', 'FULFILLED', 'CLOSED'].includes(p.status)
        );
        const onTimePOs = deliveredPOs.filter(p => {
            if (!p.expectedDeliveryDate || !p.receivedAt) return true;
            return toDate(p.receivedAt) <= toDate(p.expectedDeliveryDate);
        });
        const onTimeRate = deliveredPOs.length > 0
            ? Math.round((onTimePOs.length / deliveredPOs.length) * 100)
            : 100;

        return {
            vendorId: vendor.id || '',
            vendorName: vendor.name,
            totalSpend,
            invoiceCount: vInvoices.length,
            poCount: vPOs.length,
            onTimeRate,
            averagePayDays,
            performanceScore: vendor.scorecard?.overallScore || Math.round((onTimeRate * 0.6) + (Math.min(100, 100 - Math.abs(averagePayDays - 30)) * 0.4)),
            status: vendor.status,
        };
    })
    .filter(v => v.totalSpend > 0 || v.poCount > 0)
    .sort((a, b) => b.totalSpend - a.totalSpend);
};

/**
 * Budget vs Actual: department budget utilization
 */
export const generateBudgetVsActual = async (
    tenantId: string,
    fiscalYear?: string
): Promise<BudgetVsActualRow[]> => {
    const [budgets, invoices] = await Promise.all([
        fetchCollection<Budget>(tenantId, 'budgets'),
        fetchCollection<Invoice>(tenantId, 'invoices'),
    ]);

    const year = fiscalYear || new Date().getFullYear().toString();
    const yearBudgets = budgets.filter(b => b.fiscalYear === year);

    // Aggregate actual spend by department from paid/approved invoices
    const spendByDept: Record<string, number> = {};
    for (const inv of invoices) {
        if (!['APPROVED', 'PAID'].includes(inv.status)) continue;
        const issueYear = toDate(inv.issueDate).getFullYear().toString();
        if (issueYear !== year) continue;
        const dept = inv.department || 'Unassigned';
        spendByDept[dept] = (spendByDept[dept] || 0) + (Number(inv.amount) || 0);
    }

    return yearBudgets.map(budget => {
        const budgetAmount = Number(budget.amount) || 0;
        const actualSpend = spendByDept[budget.department] || 0;
        const committedAmount = Number(budget.committedAmount) || 0;
        const totalutilized = actualSpend + committedAmount;
        const variance = budgetAmount - totalutilized;
        const variancePercent = budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;

        let status: 'UNDER' | 'ON_TRACK' | 'OVER' = 'ON_TRACK';
        if (variancePercent > 15) status = 'UNDER';
        else if (variancePercent < -5) status = 'OVER';

        return {
            department: budget.department,
            budgetAmount,
            actualSpend,
            committedAmount,
            totalutilized,
            variance,
            variancePercent,
            status,
            currency: budget.currency || 'USD',
        };
    }).sort((a, b) => a.variancePercent - b.variancePercent);
};

/**
 * Payment History Summary for a date range
 */
export const getPaymentSummary = async (
    tenantId: string,
    range?: DateRange
): Promise<{ totalPaid: number; runCount: number; byMethod: Record<string, number> }> => {
    const runs = await fetchCollection<PaymentRun>(tenantId, 'payment_runs');
    const filtered = runs.filter(r =>
        r.status === 'COMPLETED' &&
        isInRange(r.processedAt || r.createdAt, range)
    );

    const byMethod: Record<string, number> = {};
    let totalPaid = 0;

    for (const r of filtered) {
        const amount = Number(r.totalAmount) || 0;
        totalPaid += amount;
        byMethod[r.paymentMethod] = (byMethod[r.paymentMethod] || 0) + amount;
    }

    return { totalPaid, runCount: filtered.length, byMethod };
};

// ── CSV Export ────────────────────────────────────────────────────────────────

export const exportToCsv = (headers: string[], rows: string[][], filename: string) => {
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

export const exportSpendSummaryToCsv = (data: SpendSummary) => {
    const headers = ['Department', 'Amount', 'Currency'];
    const rows = Object.entries(data.byDepartment).map(([dept, amount]) => [
        dept, amount.toFixed(2), data.currency,
    ]);
    rows.push(['TOTAL', data.totalSpend.toFixed(2), data.currency]);
    exportToCsv(headers, rows, 'spend_summary');
};

export const exportAgingToCsv = (data: AgingReport) => {
    const headers = ['Vendor', 'Invoice #', 'Amount', 'Days Overdue', 'Bucket'];
    const rows: string[][] = [];
    for (const bucket of data.buckets) {
        for (const b of bucket.bills) {
            rows.push([b.vendor, b.invoice, b.amount.toFixed(2), String(b.daysOverdue), bucket.label]);
        }
    }
    exportToCsv(headers, rows, 'aging_report');
};

export const exportVendorPerformanceToCsv = (data: VendorPerformanceRow[]) => {
    const headers = ['Vendor', 'Total Spend', 'Invoices', 'POs', 'On-Time %', 'Avg Pay Days', 'Score', 'Status'];
    const rows = data.map(v => [
        v.vendorName, v.totalSpend.toFixed(2), String(v.invoiceCount),
        String(v.poCount), `${v.onTimeRate}%`, String(v.averagePayDays),
        String(v.performanceScore), v.status,
    ]);
    exportToCsv(headers, rows, 'vendor_performance');
};

export const exportBudgetVsActualToCsv = (data: BudgetVsActualRow[]) => {
    const headers = ['Department', 'Budget', 'Actual Spend', 'Committed', 'Total Utilized', 'Variance', 'Variance %', 'Status', 'Currency'];
    const rows = data.map(b => [
        b.department, b.budgetAmount.toFixed(2), b.actualSpend.toFixed(2),
        b.committedAmount.toFixed(2), b.totalutilized.toFixed(2),
        b.variance.toFixed(2), `${b.variancePercent.toFixed(1)}%`, b.status, b.currency,
    ]);
    exportToCsv(headers, rows, 'budget_vs_actual');
};
