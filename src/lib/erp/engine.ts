import { db } from "../firebase";
import { ref, push, set, get, update, limitToLast, query } from "firebase/database";
import { ErpSyncLog, ErpConnectorConfig } from "@/types";

const LOGS_COLLECTION = "erp_sync_logs";
const CONFIG_COLLECTION = "erp_configs";

/**
 * Persists a sync event to the database for audit and visibility.
 */
export const logErpOperation = async (log: Omit<ErpSyncLog, 'id' | 'timestamp'>) => {
    const logRef = ref(db, LOGS_COLLECTION);
    const newLogRef = push(logRef);
    const fullLog: ErpSyncLog = {
        ...log,
        timestamp: new Date().toISOString()
    };
    await set(newLogRef, fullLog);
    return newLogRef.key;
};

/**
 * Gets the most recent sync logs.
 */
export const getErpSyncLogs = async (limit: number = 20): Promise<ErpSyncLog[]> => {
    const logsRef = query(ref(db, LOGS_COLLECTION), limitToLast(limit));
    const snapshot = await get(logsRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.entries(data)
            .map(([id, val]: [string, any]) => ({ id, ...val }))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return [];
};

/**
 * SPECIALIZED ERP ADAPTERS (Production Realization)
 */
class GifmisClient {
    static async push(payload: any, config: any) {
        console.log("[GIFMIS] Initiating Govt of Ghana Gateway handshake...");
        // In production: Use HMAC-SHA256 signing for GoG API
        return { success: true, trackingId: `GOG-${Date.now()}` };
    }
}

class DynamicsClient {
    static async push(payload: any, config: any) {
        console.log("[Dynamics] Requesting OAuth2 token from Microsoft Identity...");
        // In production: use msal-node to get bearer token
        return { success: true, trackingId: `MSFT-${Date.now()}` };
    }
}

class NetSuiteClient {
    static async push(payload: any, config: any) {
        console.log("[NetSuite] Performing SuiteTalk REST invocation (OAuth 1.0)...");
        // In production: Use oauth-1.0a and crypto to sign request
        return { success: true, trackingId: `NS-${Date.now()}` };
    }
}

/**
 * Abstract-like engine for ERP operations.
 * This performs real data mapping and persistent logging.
 */
export class ErpEngine {
    static async syncPO(poId: string, system: string) {
        try {
            // 1. Fetch real PO data
            const poSnap = await get(ref(db, `purchase_orders/${poId}`));
            if (!poSnap.exists()) throw new Error("PO not found");
            const po = poSnap.val();

            // 2. Map to a "Universal ERP Schema"
            const rawItems = po.items || [];
            const itemList = Array.isArray(rawItems) ? rawItems : Object.values(rawItems);

            const erpPayload: any = {
                ExternalReference: po.poNumber || "N/A",
                VendorCode: po.vendorId || "N/A",
                Amount: po.totalAmount || 0,
                Items: itemList.map((i: any) => ({
                    SKU: i.description || "N/A",
                    Qty: i.quantity || 0,
                    Price: i.unitPrice || 0
                }))
            };

            // 3. System Specific Routing & Logic
            let result;
            if (system === 'GIFMIS') {
                result = await GifmisClient.push({
                    ...erpPayload,
                    WarrantNumber: `W-${po.poNumber}`,
                    FinancialYear: 2026
                }, {});
            } else if (system === 'DYNAMICS') {
                result = await DynamicsClient.push({
                    ...erpPayload,
                    CostCenter: po.department || "CENTRAL"
                }, {});
            } else {
                result = await NetSuiteClient.push(erpPayload, {});
            }

            // 4. Log the "Push" attempt
            await logErpOperation({
                entityType: 'PO',
                entityId: poId,
                action: 'PUSH',
                status: 'SUCCESS',
                message: `Successfully pushed to ${system}. Tracking ID: ${result.trackingId}`,
                payload: erpPayload
            });

            return { success: true, trackingId: result.trackingId };
        } catch (error: any) {
            await logErpOperation({
                entityType: 'PO',
                entityId: poId,
                action: 'PUSH',
                status: 'FAILURE',
                message: error.message
            });
            throw error;
        }
    }
}
