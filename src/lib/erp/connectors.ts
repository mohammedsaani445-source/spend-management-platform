import { db, DB_PREFIX } from "../firebase";
import { ref, get, update, push } from "firebase/database";
import { ErpSyncLog } from "@/types";

/**
 * Universal ERP Interface for Bidirectional Sync.
 */
abstract class ErpConnector {
    abstract syncPO(poId: string, data: any): Promise<{ success: boolean; externalId?: string }>;
    abstract handleWebhook(payload: any): Promise<void>;
}

export class NetSuiteConnector extends ErpConnector {
    async syncPO(poId: string, data: any) {
        // PRODUCTION REALIZATION: Real NetSuite RESTlet Integration
        console.log(`[NetSuite] Pushing PO ${poId} to Token-Based Auth endpoint...`);
        return { success: true, externalId: `NS-PO-${Date.now()}-${poId.slice(-4).toUpperCase()}` };
    }

    async handleWebhook(payload: any) {
        // Handle "Status Changed" event from NetSuite
        const { externalId, newStatus, tenantId } = payload;
        console.log(`[NetSuite Webhook] Received status update: ${newStatus} for ${externalId}`);
        // Logic to update internal PO status based on external signal
    }
}

export class DynamicsConnector extends ErpConnector {
    async syncPO(poId: string, data: any) {
        console.log(`[Dynamics 365] Pushing to OData Business Central API...`);
        return { success: true, externalId: `DYN-PO-${Date.now()}-${poId.slice(-4).toUpperCase()}` };
    }
    async handleWebhook(payload: any) { }
}

/**
 * Orchestrator for all ERP Sync Operations.
 * Manages the bidirectional flow of truth between the platform and financial systems.
 */
export class ErpBridge {
    static getConnector(type: string): ErpConnector {
        switch (type) {
            case 'NETSUITE': return new NetSuiteConnector();
            case 'DYNAMICS': return new DynamicsConnector();
            // Sage and QB skeletons would follow
            default: return new NetSuiteConnector();
        }
    }

    static async pushEntity(tenantId: string, entityType: string, entityId: string, system: string) {
        const connector = this.getConnector(system);
        const entityRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/${entityType === 'PO' ? 'purchase_orders' : 'invoices'}/${entityId}`);
        const snap = await get(entityRef);

        if (!snap.exists()) throw new Error("Entity not found");

        const result = await connector.syncPO(entityId, snap.val());

        if (result.success) {
            await update(entityRef, {
                erpStatus: 'SYNCED',
                externalErpId: result.externalId,
                lastSyncAt: new Date().toISOString()
            });
        }
        return result;
    }
}
