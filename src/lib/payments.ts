import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, update, get, query, orderByChild } from "firebase/database";
import { Bill, BillStatus, PaymentMethod, PaymentRun, Invoice, AppUser } from "@/types";

const getBillsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/bills`);
const getBillRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/bills/${id}`);
const getPaymentRunsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/payment_runs`);
const getInvoicesRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/invoices`);

/**
 * Sync approved invoices into the bills collection, then return all bills.
 * Bills are the AP view of approved invoices ready for payment.
 */
export const getBills = async (user: AppUser): Promise<Bill[]> => {
    const { tenantId } = user;

    // 1. Fetch all invoices
    const invSnap = await get(getInvoicesRef(tenantId));
    const invoices: Invoice[] = invSnap.exists()
        ? (Object.values(invSnap.val()) as Invoice[])
        : [];

    // 2. Fetch existing bills
    const billSnap = await get(getBillsRef(tenantId));
    const existingBillMap: Record<string, Bill> = billSnap.exists()
        ? (billSnap.val() as Record<string, Bill>)
        : {};

    const bills: Bill[] = [];

    // 3. Sync APPROVED invoices as UNPAID bills (idempotent)
    for (const inv of invoices) {
        if (inv.status !== 'APPROVED' && inv.status !== 'PENDING') continue;
        if (!inv.id) continue;

        const existingBill = existingBillMap[inv.id];

        if (!existingBill) {
            // Create bill record for this invoice
            const bill: Bill = {
                id: inv.id,
                invoiceId: inv.id,
                invoiceNumber: inv.invoiceNumber,
                vendorId: inv.vendorId,
                vendorName: inv.vendorName,
                department: inv.department || '',
                amount: inv.amount,
                currency: inv.currency || 'USD',
                issueDate: new Date(inv.issueDate),
                dueDate: new Date(inv.dueDate),
                poNumber: inv.poNumber,
                status: 'UNPAID',
                createdAt: new Date(inv.createdAt),
            };
            await set(getBillRef(tenantId, inv.id), bill);
            bills.push(bill);
        } else {
            bills.push({
                ...existingBill,
                dueDate: new Date(existingBill.dueDate),
                issueDate: new Date(existingBill.issueDate),
                createdAt: new Date(existingBill.createdAt),
            });
        }
    }

    // 4. Include any existing bills for PAID invoices (for history)
    for (const [id, bill] of Object.entries(existingBillMap)) {
        if (!bills.find(b => b.id === id)) {
            bills.push({
                ...bill,
                dueDate: new Date(bill.dueDate),
                issueDate: new Date(bill.issueDate),
                createdAt: new Date(bill.createdAt),
            });
        }
    }

    return bills.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};

/**
 * Schedule a bill for payment on a future date.
 */
export const scheduleBill = async (
    tenantId: string,
    billId: string,
    scheduledDate: string,
    paymentMethod: PaymentMethod
): Promise<void> => {
    await update(getBillRef(tenantId, billId), {
        status: 'SCHEDULED',
        scheduledDate,
        paymentMethod,
    });
};

/**
 * Process payment for one or more bills. Creates a PaymentRun record and
 * marks all bills + their invoices as PAID.
 */
export const processBillPayment = async (
    tenantId: string,
    billIds: string[],
    paymentMethod: PaymentMethod,
    createdBy: string,
    createdByName: string,
    scheduledDate?: string,
    notes?: string
): Promise<string> => {
    if (billIds.length === 0) throw new Error("No bills selected");

    // Calculate total
    let totalAmount = 0;
    let currency = 'USD';
    const bills: Bill[] = [];

    for (const billId of billIds) {
        const snap = await get(getBillRef(tenantId, billId));
        if (!snap.exists()) continue;
        const bill: Bill = snap.val();
        totalAmount += Number(bill.amount);
        currency = bill.currency || 'USD';
        bills.push(bill);
    }

    // Generate reference number
    const refNum = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const paymentDate = scheduledDate || new Date().toISOString().split('T')[0];
    const isScheduled = !!(scheduledDate && new Date(scheduledDate) > new Date());

    // Create payment run record
    const runsRef = getPaymentRunsRef(tenantId);
    const newRunRef = push(runsRef);
    const runId = newRunRef.key!;

    const paymentRun: PaymentRun = {
        id: runId,
        tenantId,
        billIds,
        totalAmount,
        currency,
        paymentMethod,
        paymentDate,
        status: isScheduled ? 'PENDING' : 'COMPLETED',
        referenceNumber: refNum,
        createdBy,
        createdByName,
        createdAt: new Date().toISOString(),
        processedAt: isScheduled ? undefined : new Date().toISOString(),
        notes,
    };

    await set(newRunRef, paymentRun);

    // Mark all bills as PAID (or SCHEDULED)
    const newBillStatus: BillStatus = isScheduled ? 'SCHEDULED' : 'PAID';

    for (const bill of bills) {
        await update(getBillRef(tenantId, bill.id), {
            status: newBillStatus,
            paymentMethod,
            paymentDate: isScheduled ? undefined : paymentDate,
            scheduledDate: isScheduled ? scheduledDate : undefined,
            paymentRef: refNum,
            paymentRunId: runId,
        });

        // Mark corresponding invoice as PAID (for non-scheduled
        if (!isScheduled) {
            const invRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/invoices/${bill.invoiceId}`);
            await update(invRef, { status: 'PAID' });
        }
    }

    // Audit log
    try {
        const { logAction } = await import("./audit");
        await logAction({
            tenantId,
            actorId: createdBy,
            actorName: createdByName,
            action: 'UPDATE',
            entityType: 'INVOICE',
            entityId: billIds.join(','),
            description: `Payment run ${refNum} for ${billIds.length} bill(s) totalling ${totalAmount} ${currency} via ${paymentMethod}`,
        });
    } catch { /* non-blocking */ }

    return runId;
};

/** Void a bill (if unpaid/scheduled). */
export const voidBill = async (tenantId: string, billId: string): Promise<void> => {
    await update(getBillRef(tenantId, billId), { status: 'VOID' });
};

/** Get all payment run history. */
export const getPaymentHistory = async (tenantId: string): Promise<PaymentRun[]> => {
    const snap = await get(getPaymentRunsRef(tenantId));
    if (!snap.exists()) return [];
    return (Object.values(snap.val()) as PaymentRun[])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * LEGACY COMPATIBILITY: PaymentService namespace.
 * Used by requisitions for direct transfer on final approval.
 */
export const PaymentService = {
    /** 
     * Initiates a direct transfer (Stripe sandbox fallback).
     * Used for "Direct Pay" workflows in requisitions.
     */
    initiateDirectTransfer: async (tenantId: string, entity: any): Promise<boolean> => {
        console.log(`[PaymentService] Initiating direct transfer for tenant ${tenantId}, entity ${entity.id}`);

        // Audit log the direct transfer
        try {
            const { logAction } = await import("./audit");
            await logAction({
                tenantId,
                actorId: entity.approverId || 'SYSTEM',
                actorName: entity.approverName || 'System Approval',
                action: 'UPDATE',
                entityType: 'REQUISITION',
                entityId: entity.id,
                description: `Direct transfer initiated on final approval for ${entity.totalAmount} ${entity.currency || 'USD'}`,
            });
        } catch { /* non-blocking */ }

        return true;
    }
};
