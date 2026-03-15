import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, child, update, query, orderByChild, equalTo, onValue } from "firebase/database";
import { Invoice, InvoiceStatus, AppUser, PurchaseOrder } from "@/types";
import { performThreeWayMatch } from "./matching";

const getInvoicesRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/invoices`);
const getInvoiceRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/invoices/${id}`);

export const createInvoice = async (tenantId: string, invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    try {
        const invRef = getInvoicesRef(tenantId);
        const newInvRef = push(invRef);

        await set(newInvRef, {
            ...invoice,
            tenantId,
            issueDate: invoice.issueDate instanceof Date ? invoice.issueDate.toISOString() : invoice.issueDate,
            dueDate: invoice.dueDate instanceof Date ? invoice.dueDate.toISOString() : invoice.dueDate,
            createdAt: new Date().toISOString(),
            status: invoice.status || 'PENDING',
            department: invoice.department,
            fileName: invoice.fileName || null,
            fileUrl: invoice.fileUrl || null,
            confidence: invoice.confidence || null,
            hasFraudAlert: invoice.hasFraudAlert || false,
            fraudCheckReason: invoice.fraudCheckReason || null,
            autoExtracted: invoice.autoExtracted || false
        });

        const newId = newInvRef.key;

        // 🔔 Notification Trigger (Phase 57)
        try {
            const { notifyRole } = await import("./notifications");
            await notifyRole(
                tenantId,
                'FINANCE_MANAGER',
                'INVOICE_SUBMITTED',
                'New Invoice Uploaded',
                `A new invoice (${invoice.invoiceNumber}) for ${invoice.vendorName} has been uploaded and is pending review.`,
                `/dashboard/invoices`
            );
        } catch (err) {
            console.error("Notify error:", err);
        }

        // Phase 44: Automate 3-way match trigger
        if (invoice.poId) {
            // Trigger matching logic in background
            performThreeWayMatch(tenantId, invoice.poId).catch(err => 
                console.error(`[Invoices] Automated Match Failed for PO ${invoice.poId}:`, err)
            );
        }

        return newId;
    } catch (error) {
        console.error("Error creating invoice: ", error);
        throw error;
    }
};

export const subscribeToInvoices = (user: AppUser, callback: (invoices: Invoice[]) => void) => {
    if (!user || !user.tenantId) {
        callback([]);
        return () => { };
    }

    const tenantId = user.tenantId;
    const invRef = getInvoicesRef(tenantId);

    // Admins and Finance see all 
    if (['ADMIN', 'WORKSPACE_ADMIN', 'PLATFORM_SUPERUSER', 'FINANCE_MANAGER', 'ACCOUNTS_PAYABLE'].includes(user.role)) {
        const unsubscribe = onValue(invRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const invoices = Object.entries(data).map(([key, v]: [string, any]) => ({
                    id: key,
                    ...v,
                    issueDate: new Date(v.issueDate),
                    dueDate: new Date(v.dueDate),
                    createdAt: new Date(v.createdAt),
                })) as Invoice[];
                callback(invoices.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
            } else {
                callback([]);
            }
        });
        return unsubscribe;
    }

    // Department Isolation
    const dept = user.department || 'General';
    const unsubscribe = onValue(invRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const invoices = Object.entries(data).map(([key, v]: [string, any]) => ({
                id: key,
                ...v,
                issueDate: new Date(v.issueDate),
                dueDate: new Date(v.dueDate),
                createdAt: new Date(v.createdAt),
            })) as Invoice[];

            const filtered = invoices.filter(i => i.department === dept);
            callback(filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        } else {
            callback([]);
        }
    });

    return unsubscribe;
};

export const getInvoices = async (user: AppUser): Promise<Invoice[]> => {
    return new Promise((resolve) => {
        const unsubscribe = subscribeToInvoices(user, (data) => {
            unsubscribe();
            resolve(data);
        });
    });
};

export const updateInvoiceStatus = async (tenantId: string, invId: string, status: InvoiceStatus) => {
    try {
        const invRef = getInvoiceRef(tenantId, invId);
        await update(invRef, { status });
    } catch (error: any) {
        console.error(`[Invoices] Error updating invoice ${invId}:`, error);
        throw error;
    }
};

/**
 * Specifically for vendors submitting invoices via the portal.
 */
export const createVendorInvoice = async (tenantId: string, invoice: Omit<Invoice, 'id' | 'createdAt'>, po: PurchaseOrder) => {
    try {
        const invId = await createInvoice(tenantId, {
            ...invoice,
            status: 'SUBMITTED',
            poId: po.id,
            poNumber: po.poNumber
        });

        // Audit Log
        const { logAction } = await import("./audit");
        await logAction({
            tenantId,
            actorId: po.vendorId,
            actorName: invoice.vendorName,
            action: 'CREATE',
            entityType: 'INVOICE',
            entityId: invId!,
            description: `Invoice ${invoice.invoiceNumber} submitted by vendor for PO ${po.poNumber}.`
        });

        // Trigger matches
        await performThreeWayMatch(tenantId, po.id as string);

        // Notify Finance (Phase 57: Upgraded)
        try {
            const { notifyUser, notifyRole } = await import("./notifications");
            // Notify PO Issuer
            await notifyUser(
                tenantId,
                po.issuedBy,
                'INVOICE_SUBMITTED',
                'Vendor Invoice Submitted',
                `${invoice.vendorName} has submitted invoice ${invoice.invoiceNumber} for your PO ${po.poNumber}.`,
                '/dashboard/invoices'
            );
            // Notify Finance Team
            await notifyRole(
                tenantId,
                'ACCOUNTS_PAYABLE',
                'INVOICE_SUBMITTED',
                'New Vendor Invoice',
                `Vendor ${invoice.vendorName} submitted invoice ${invoice.invoiceNumber} for tracking.`,
                '/dashboard/invoices'
            );
        } catch (err) {
            console.error("Notify error:", err);
        }

        return invId;
    } catch (error) {
        console.error("[Invoices] Error creating vendor invoice:", error);
        throw error;
    }
};

/**
 * Checks if an invoice number already exists for a specific vendor.
 * Prevents double-payments and duplicate entries.
 */
export const checkDuplicateInvoice = async (tenantId: string, vendorName: string, invoiceNumber: string): Promise<boolean> => {
    try {
        const invRef = getInvoicesRef(tenantId);
        const snapshot = await get(invRef);

        if (!snapshot.exists()) return false;

        const invoices = Object.values(snapshot.val()) as Invoice[];
        return invoices.some(inv =>
            inv.vendorName?.toLowerCase() === vendorName.toLowerCase() &&
            inv.invoiceNumber === invoiceNumber
        );
    } catch (error) {
        console.error("[Invoices] Error checking duplicates:", error);
        return false;
    }
};
