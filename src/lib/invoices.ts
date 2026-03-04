import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, child, update, query, orderByChild, equalTo, onValue } from "firebase/database";
import { Invoice, InvoiceStatus, AppUser } from "@/types";

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
            fileUrl: invoice.fileUrl || null
        });

        return newInvRef.key;
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
    if (user.role === 'ADMIN' || user.role === 'FINANCE') {
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
