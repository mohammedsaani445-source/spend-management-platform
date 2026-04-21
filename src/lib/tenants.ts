import { db, DB_PREFIX } from "./firebase";
import { ref, get } from "firebase/database";

export interface Tenant {
    id: string;
    name: string;
    currency: string;
    createdAt: number;
    plan?: 'BASIC' | 'PRO' | 'ENTERPRISE';
    settings?: TenantSettings;
}

export interface TenantSettings {
    baseCurrency: string;
    requireThreeWayMatch?: boolean;
    budgetEnforcementLevel?: 'SOFT' | 'HARD';
}

/**
 * Fetches all registered tenants. 
 * Safe for client-side use (reads from public registry).
 */
export const getAllTenants = async (): Promise<Tenant[]> => {
    try {
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

/**
 * Fetches a specific tenant.
 * Safe for client-side use.
 */
export const getTenant = async (id: string): Promise<Tenant | null> => {
    const tenantRef = ref(db, `${DB_PREFIX}/tenants/${id}`);
    const snapshot = await get(tenantRef);
    if (snapshot.exists()) {
        return { id, ...snapshot.val() } as Tenant;
    }
    return null;
};
