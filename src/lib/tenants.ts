import { db, DB_PREFIX } from "./firebase";
import { ref, get, set } from "firebase/database";

export interface Tenant {
    id: string;
    name: string;
    currency: string;
    createdAt: number;
    plan?: 'BASIC' | 'PRO' | 'ENTERPRISE';
}

export const getAllTenants = async (): Promise<Tenant[]> => {
    try {
        // We read from a registry path which is intended to be readable by admins
        const registryRef = ref(db, `${DB_PREFIX}/tenant_registry`);
        const snapshot = await get(registryRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.entries(data).map(([id, val]: [string, any]) => ({
                id,
                name: val.name || 'Unnamed Workspace',
                currency: val.currency || 'USD',
                createdAt: val.createdAt || Date.now()
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching tenants from registry:", error);
        throw error;
    }
};

export const createTenant = async (data: Omit<Tenant, 'id'>): Promise<string> => {
    const tenantsRef = ref(db, `${DB_PREFIX}/tenants`);
    const { push, update } = await import("firebase/database");
    const newTenantRef = push(tenantsRef);
    const tenantId = newTenantRef.key;
    if (!tenantId) throw new Error("Failed to generate tenant ID");

    // Atomic update to both the tenant data and the registry
    const updates: any = {};
    updates[`${DB_PREFIX}/tenants/${tenantId}`] = data;
    updates[`${DB_PREFIX}/tenant_registry/${tenantId}`] = {
        name: data.name,
        currency: data.currency,
        createdAt: data.createdAt
    };

    await update(ref(db), updates);
    return tenantId;
};

/**
 * Utility to backfill the registry from existing tenants.
 * Should be run once by an admin who has full read access to /tenants.
 */
export const backfillTenantRegistry = async (): Promise<number> => {
    const tenantsRef = ref(db, `${DB_PREFIX}/tenants`);
    const snapshot = await get(tenantsRef);
    if (!snapshot.exists()) return 0;

    const allTenants = snapshot.val();
    const updates: any = {};
    let count = 0;

    Object.entries(allTenants).forEach(([id, val]: [string, any]) => {
        updates[`${DB_PREFIX}/tenant_registry/${id}`] = {
            name: val.name || "Unknown",
            currency: val.currency || "USD",
            createdAt: val.createdAt || Date.now()
        };
        count++;
    });

    if (count > 0) {
        const { update } = await import("firebase/database");
        await update(ref(db), updates);
    }
    return count;
};
