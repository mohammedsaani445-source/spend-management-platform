import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, child, update, query, orderByChild, equalTo, onValue } from "firebase/database";
import { PurchaseOrder, Requisition, POStatus, AppUser } from "@/types";
import { getVendor } from "./vendors";

const getPOsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/purchase_orders`);
const getPORef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/purchase_orders/${id}`);

const generatePONumber = async (): Promise<string> => {
    // Simple autoincrement logic or timestamp based
    // Ideally use a transaction counter in DB
    const timestamp = Date.now().toString().slice(-6);
    return `PO-2026-${timestamp}`;
};

export const createPOFromRequisition = async (tenantId: string, requisition: Requisition, userId: string) => {
    try {
        const poNumber = await generatePONumber();
        const vendor = await getVendor(tenantId, requisition.vendorId!); // Note: Vendor lookup might need tenant isolation too in complex apps, but keeping simple for now

        const poRef = getPOsRef(tenantId);
        const newPORef = push(poRef);

        const newPO: PurchaseOrder = {
            tenantId,
            poNumber,
            requisitionId: requisition.id!,
            vendorId: requisition.vendorId!,
            vendorName: requisition.vendorName!,
            vendorEmail: vendor?.email,
            items: requisition.items,
            totalAmount: requisition.totalAmount,
            currency: requisition.currency,
            status: 'ISSUED',
            issuedAt: new Date().toISOString() as any,
            expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() as any,
            issuedBy: userId,
            department: requisition.department
        };

        await set(newPORef, newPO);

        // Update Requisition status
        const reqRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/requisitions/${requisition.id}`);
        await update(reqRef, { status: 'ORDERED' });

        return newPORef.key;
    } catch (error) {
        console.error("Error creating PO:", error);
        throw error;
    }
};

export const subscribeToPurchaseOrders = (user: AppUser, callback: (pos: PurchaseOrder[]) => void) => {
    if (!user || !user.tenantId) {
        callback([]);
        return () => { };
    }

    const tenantId = user.tenantId;
    const poRef = getPOsRef(tenantId);

    // Admins, Finance, Superusers see all 
    if (user.role === 'ADMIN' || user.role === 'FINANCE' || user.role === 'SUPERUSER') {
        const unsubscribe = onValue(poRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const pos = Object.entries(data).map(([key, v]: [string, any]) => ({
                    id: key,
                    ...v,
                    issuedAt: new Date(v.issuedAt),
                })) as PurchaseOrder[];
                callback(pos.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime()));
            } else {
                callback([]);
            }
        });
        return unsubscribe;
    }

    // Requester Isolation
    const unsubscribe = onValue(poRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const pos = Object.entries(data).map(([key, v]: [string, any]) => ({
                id: key,
                ...v,
                issuedAt: new Date(v.issuedAt),
            })) as PurchaseOrder[];

            const filtered = pos.filter(p => p.issuedBy === user.uid);
            callback(filtered.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime()));
        } else {
            callback([]);
        }
    });

    return unsubscribe;
};

export const getPurchaseOrders = async (user: AppUser): Promise<PurchaseOrder[]> => {
    return new Promise((resolve) => {
        const unsubscribe = subscribeToPurchaseOrders(user, (data) => {
            unsubscribe();
            resolve(data);
        });
    });
};

export const updatePOStatus = async (tenantId: string, poId: string, status: POStatus) => {
    try {
        const poRef = getPORef(tenantId, poId);
        const updates: any = { status };
        if (status === 'RECEIVED') {
            updates.receivedAt = new Date().toISOString();
        }
        if (status === 'CANCELLED') {
            updates.cancelledAt = new Date().toISOString();
        }
        if (status === 'FULFILLED') {
            updates.fulfilledAt = new Date().toISOString();
        }
        await update(poRef, updates);
    } catch (error: any) {
        console.error(`[PurchaseOrders] Error updating PO ${poId} status:`, error);
        throw error;
    }
};

export const logDeliveryEvent = async (tenantId: string, poId: string, action: 'SENT' | 'OPENED' | 'ACKNOWLEDGED', performer: string) => {
    try {
        const poRef = getPORef(tenantId, poId);
        const snapshot = await get(poRef);
        if (!snapshot.exists()) return;

        const currentData = snapshot.val();
        const history = currentData.deliveryHistory || [];

        const newEvent = {
            timestamp: new Date().toISOString(),
            action,
            performedBy: performer
        };

        const updates: any = {
            deliveryHistory: [...history, newEvent]
        };

        // Update top-level status based on tracking
        if (action === 'SENT') updates.status = 'SENT';
        if (action === 'OPENED' && currentData.status !== 'ACKNOWLEDGED') updates.status = 'OPENED';
        if (action === 'ACKNOWLEDGED') updates.status = 'ACKNOWLEDGED';

        if (action === 'OPENED' && !currentData.firstViewedAt) {
            updates.firstViewedAt = newEvent.timestamp;
        }
        if (action === 'OPENED') {
            updates.lastViewedAt = newEvent.timestamp;
        }

        await update(poRef, updates);

        // Trigger Notifications for stakeholders
        const { createNotification } = await import("./notifications");

        const recipientId = currentData.issuedBy;
        if (!recipientId) return;

        if (action === 'OPENED') {
            await createNotification({
                tenantId,
                userId: recipientId,
                type: 'PO_OPENED',
                title: 'PO Viewed by Vendor',
                message: `${currentData.vendorName} viewed PO ${currentData.poNumber}`,
                link: '/dashboard/purchase-orders'
            });
        }
        if (action === 'ACKNOWLEDGED') {
            await createNotification({
                tenantId,
                userId: recipientId,
                type: 'PO_ACKNOWLEDGED',
                title: 'PO Acknowledged',
                message: `${currentData.vendorName} confirmed receipt of PO ${currentData.poNumber}`,
                link: '/dashboard/purchase-orders'
            });
        }
    } catch (error) {
        console.error("Error logging delivery event", error);
    }
};

export const getPurchaseOrderById = async (tenantId: string, id: string): Promise<PurchaseOrder | null> => {
    try {
        const poRef = getPORef(tenantId, id);
        const snapshot = await get(poRef);
        if (snapshot.exists()) {
            const v = snapshot.val();
            return {
                id,
                ...v,
                issuedAt: new Date(v.issuedAt),
            } as PurchaseOrder;
        }
        return null;
    } catch (error) {
        console.error("Error fetching PO by ID", error);
        return null;
    }
};
