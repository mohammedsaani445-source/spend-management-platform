import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, child, update, query, orderByChild, equalTo, onValue } from "firebase/database";
import { PurchaseOrder, Requisition, POStatus, AppUser, Tender, Bid, ShippingDetails } from "@/types";
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
    if (['ADMIN', 'WORKSPACE_ADMIN', 'PLATFORM_SUPERUSER', 'FINANCE_MANAGER', 'FINANCE_SPECIALIST'].includes(user.role)) {
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
            
            // --- Phase 58: Strategic Budget Enforcement ---
            // Release funds back to Budget
            try {
                const snapshot = await get(poRef);
                if (snapshot.exists()) {
                    const po = snapshot.val();
                    const { releaseFunds } = await import("./budgets");
                    await releaseFunds(tenantId, po.department, po.totalAmount);
                }
            } catch (budgetError) {
                console.error("[Budget] Failed to release funds on PO cancellation:", budgetError);
            }
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
export const resolveDiscrepancy = async (tenantId: string, poId: string, resolution: 'MATCH' | 'REJECT', note: string, actor: AppUser) => {
    try {
        const poRef = getPORef(tenantId, poId);
        const updates: any = {
            status: resolution === 'MATCH' ? 'BILLED' : 'DISCREPANCY_FLAGGED',
            isMatched: resolution === 'MATCH',
            discrepancyNote: `Resolved as ${resolution}: ${note} (by ${actor.displayName})`
        };

        if (resolution === 'MATCH') {
            updates.reconciledAt = new Date().toISOString();
            updates.reconciledBy = actor.uid;
        }

        await update(poRef, updates);

        // Audit Log
        const { logAction } = await import("./audit");
        await logAction({
            tenantId,
            actorId: actor.uid,
            actorName: actor.displayName,
            action: 'UPDATE',
            entityType: 'PURCHASE_ORDER',
            entityId: poId,
            description: `3-Way Match Discrepancy Resolved (${resolution}). Note: ${note}`
        });
    } catch (error) {
        console.error("Error resolving discrepancy:", error);
        throw error;
    }
};

/**
 * Creates a Purchase Order from an awarded bid and its parent tender.
 */
export const createPOFromAwardedBid = async (
    tenantId: string,
    tender: Tender,
    bid: Bid,
    actor: AppUser
) => {
    try {
        const poNumber = await generatePONumber();
        const poRef = getPOsRef(tenantId);
        const newPORef = push(poRef);

        // Map Tender items or create a generic one if empty
        const items = tender.items && tender.items.length > 0 
            ? tender.items 
            : [{
                id: crypto.randomUUID(),
                description: `Sourcing Award: ${tender.title}`,
                quantity: 1,
                unitPrice: bid.amount,
                total: bid.amount
            }];

        const newPO: PurchaseOrder = {
            tenantId,
            poNumber,
            requisitionId: tender.id, // Linking to tender as the "source"
            vendorId: bid.vendorId,
            vendorName: bid.vendorName,
            items: items as any,
            totalAmount: bid.amount,
            currency: bid.currency,
            status: 'ISSUED',
            issuedAt: new Date().toISOString() as any,
            issuedBy: actor.uid,
            department: actor.department || 'Procurement',
            locationId: actor.locationId,
            expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() as any,
            issuedByName: actor.displayName,
            vendorEmail: bid.vendorId // Placeholder for vendor email if not found, usually we'd fetch it
        };

        await set(newPORef, newPO);

        return { id: newPORef.key, poNumber };
    } catch (error) {
        console.error("[PurchaseOrders] Error creating PO from bid:", error);
        throw error;
    }
};

/**
 * Acknowledges a Purchase Order by a vendor.
 */
export const acknowledgePO = async (tenantId: string, po: PurchaseOrder, vendorName: string) => {
    try {
        const poRef = getPORef(tenantId, po.id!);
        
        const timestamp = new Date().toISOString();
        const deliveryEvent = {
            timestamp,
            action: 'ACKNOWLEDGED' as const,
            performedBy: 'VENDOR',
            details: `Order acknowledged by ${vendorName}`
        };

        const history = po.deliveryHistory || [];

        await update(poRef, {
            status: 'ACKNOWLEDGED',
            deliveryHistory: [...history, deliveryEvent]
        });

        // Audit Log
        const { logAction } = await import("./audit");
        await logAction({
            tenantId,
            actorId: po.vendorId, // Vendor ID as actor
            actorName: vendorName,
            action: 'UPDATE',
            entityType: 'PURCHASE_ORDER',
            entityId: po.id!,
            description: `PO ${po.poNumber} acknowledged by vendor ${vendorName}`
        });

        // Notify Procurement Officer
        const { createNotification } = await import("./notifications");
        if (po.issuedBy) {
            await createNotification({
                tenantId,
                userId: po.issuedBy,
                type: 'PO_ACKNOWLEDGED',
                title: 'Order Acknowledged',
                message: `${vendorName} has accepted PO ${po.poNumber}`,
                link: `/dashboard/purchase-orders/${po.id}`
            });
        }

        return true;
    } catch (error) {
        console.error("[PurchaseOrders] Error acknowledging PO:", error);
        throw error;
    }
};

/**
 * Marks a Purchase Order as SHIPPED and saves tracking details.
 */
export const shipOrder = async (
    tenantId: string, 
    po: PurchaseOrder, 
    shippingDetails: ShippingDetails,
    vendorName: string
) => {
    try {
        const poRef = getPORef(tenantId, po.id!);
        
        const timestamp = new Date().toISOString();
        const deliveryEvent = {
            timestamp,
            action: 'SHIPPED' as const,
            performedBy: 'VENDOR',
            details: `Order shipped via ${shippingDetails.carrier}. Tracking: ${shippingDetails.trackingNumber}`
        };

        const history = po.deliveryHistory || [];

        await update(poRef, {
            status: 'SHIPPED',
            shippingDetails,
            deliveryHistory: [...history, deliveryEvent]
        });

        // Audit Log
        const { logAction } = await import("./audit");
        await logAction({
            tenantId,
            actorId: po.vendorId,
            actorName: vendorName,
            action: 'UPDATE',
            entityType: 'PURCHASE_ORDER',
            entityId: po.id!,
            description: `PO ${po.poNumber} marked as SHIPPED. Carrier: ${shippingDetails.carrier}, Tracking: ${shippingDetails.trackingNumber}`
        });

        // Notify Procurement Officer
        const { createNotification } = await import("./notifications");
        if (po.issuedBy) {
            await createNotification({
                tenantId,
                userId: po.issuedBy,
                type: 'PO_SHIPPED',
                title: 'Order Shipped',
                message: `${vendorName} has shipped PO ${po.poNumber}. Tracking: ${shippingDetails.trackingNumber}`,
                link: `/dashboard/purchase-orders/${po.id}`
            });
        }

        return true;
    } catch (error) {
        console.error("[PurchaseOrders] Error shipping PO:", error);
        throw error;
    }
};
