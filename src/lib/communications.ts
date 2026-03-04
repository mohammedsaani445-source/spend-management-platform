import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, update, query, orderByChild, equalTo } from "firebase/database";
import { CommunicationLog, VendorActionStatus } from "@/types";
import { generatePortalLink } from "./portal";
import { logDeliveryEvent } from "./purchaseOrders";

const getCommsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/communications`);
const getVendorActionsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/vendorActions`);

/**
 * Log a new communication.
 */
export const logCommunication = async (tenantId: string, log: Omit<CommunicationLog, 'id'>): Promise<string> => {
    try {
        const commsRef = getCommsRef(tenantId);
        const newCommRef = push(commsRef);
        const commId = newCommRef.key!;

        await set(newCommRef, {
            ...log,
            timestamp: log.timestamp instanceof Date ? log.timestamp.toISOString() : log.timestamp
        });

        if (log.type === 'EMAIL' && log.sentTo && log.sentTo.length > 0) {
            // Generate magic link
            let magicLink = "";
            try {
                if (log.vendorId) {
                    magicLink = await generatePortalLink(tenantId, log.vendorId);
                }
            } catch (linkError) {
                console.warn("[Communication] Could not generate magic link:", linkError);
            }

            // Update Live Delivery Analytics on the PO
            if (log.poId) {
                try {
                    await logDeliveryEvent(tenantId, log.poId, 'SENT', log.sentByName || 'System');
                } catch (err) {
                    console.error("[Communication] Failed to update delivery history on PO:", err);
                }
            }


            const bodyWithLink = magicLink
                ? `${log.body}\n\n---\n🔗 Access your Secure Vendor Portal here: ${magicLink}`
                : log.body;

            const deliveryPayload = {
                to: log.sentTo[0],
                subject: log.subject,
                body: bodyWithLink,
                metadata: { commId, poId: log.poId, vendorId: log.vendorId, sender: log.sentByName }
            };

            try {
                const response = await fetch('/api/communications/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(deliveryPayload)
                });
                if (!response.ok) console.error("[Email] Gateway error:", response.status);
            } catch (deliverError) {
                console.warn("[Email] Gateway unavailable, logged only:", deliverError);
            }
        }

        return commId;
    } catch (error) {
        console.error("Error logging communication:", error);
        throw error;
    }
};

/**
 * Get all communication logs for a specific PO.
 */
export const getCommunicationHistory = async (tenantId: string, poId: string): Promise<CommunicationLog[]> => {
    if (!poId) return [];
    try {
        const q = query(getCommsRef(tenantId), orderByChild('poId'), equalTo(poId));
        const snapshot = await get(q);

        if (snapshot.exists()) {
            return Object.entries(snapshot.val()).map(([key, v]: [string, any]) => ({
                id: key,
                ...v,
                timestamp: new Date(v.timestamp),
                readReceipt: v.readReceipt ? new Date(v.readReceipt) : undefined
            })) as CommunicationLog[];
        }
        return [];
    } catch (error: any) {
        if (error.code === 'PERMISSION_DENIED' || error.message?.includes('Permission denied')) {
            console.warn(`[Communications] Permission denied for PO ${poId} in tenant ${tenantId}. Ensure user is logged in and belongs to this tenant.`);
        } else {
            console.error("Error fetching communication history:", error);
        }
        return [];
    }
};

/**
 * Mark a communication as read.
 */
export const markCommunicationAsRead = async (tenantId: string, logId: string): Promise<void> => {
    try {
        const commRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/communications/${logId}`);
        await update(commRef, { readReceipt: new Date().toISOString() });
    } catch (error) {
        console.error("Error marking communication as read:", error);
        throw error;
    }
};

/**
 * Calculate vendor action status for a PO.
 */
export const getVendorActionStatus = async (tenantId: string, poId: string): Promise<VendorActionStatus | null> => {
    try {
        const history = await getCommunicationHistory(tenantId, poId);

        if (history.length === 0) {
            return { poId, status: 'PENDING_ACKNOWLEDGMENT', escalationLevel: 0 };
        }

        const sortedHistory = history.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const lastContact = sortedHistory[0];
        const lastContactDate = new Date(lastContact.timestamp);
        const now = new Date();
        const daysSinceLastContact = Math.floor((now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));

        const hasAcknowledgment = history.some(log =>
            log.type === 'EMAIL' && log.subject.toLowerCase().includes('acknowledged')
        );

        let status: VendorActionStatus['status'] = 'PENDING_ACKNOWLEDGMENT';
        let escalationLevel: 0 | 1 | 2 | 3 = 0;

        if (hasAcknowledgment) {
            status = 'ACKNOWLEDGED';
        } else if (daysSinceLastContact > 7) {
            status = 'OVERDUE'; escalationLevel = 3;
        } else if (daysSinceLastContact > 3) {
            status = 'OVERDUE'; escalationLevel = 2;
        } else if (daysSinceLastContact > 1) {
            escalationLevel = 1;
        }

        return {
            poId,
            status,
            lastContact: lastContactDate,
            responseDeadline: new Date(lastContactDate.getTime() + (2 * 24 * 60 * 60 * 1000)),
            escalationLevel,
            daysSinceLastContact
        };
    } catch (error) {
        console.error("Error calculating vendor action status:", error);
        return null;
    }
};

/**
 * Save vendor action status.
 */
export const saveVendorActionStatus = async (tenantId: string, status: VendorActionStatus): Promise<void> => {
    try {
        const statusRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/vendorActions/${status.poId}`);
        await set(statusRef, {
            ...status,
            lastContact: status.lastContact?.toISOString(),
            responseDeadline: status.responseDeadline?.toISOString()
        });
    } catch (error) {
        console.error("Error saving vendor action status:", error);
        throw error;
    }
};

/**
 * Get all pending vendor actions.
 */
export const getPendingVendorActions = async (tenantId: string): Promise<VendorActionStatus[]> => {
    try {
        const snapshot = await get(getVendorActionsRef(tenantId));

        if (snapshot.exists()) {
            return Object.values(snapshot.val()).map((v: any) => ({
                ...v,
                lastContact: v.lastContact ? new Date(v.lastContact) : undefined,
                responseDeadline: v.responseDeadline ? new Date(v.responseDeadline) : undefined
            })) as VendorActionStatus[];
        }
        return [];
    } catch (error) {
        console.error("Error fetching pending vendor actions:", error);
        return [];
    }
};
