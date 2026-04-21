import "server-only";
import { adminDb } from "./firebaseAdmin";
import { Tenant } from "./tenants";

const DB_PREFIX = process.env.NEXT_PUBLIC_FIREBASE_DB_PREFIX || "prod";

/**
 * Creates a new tenant and seeds default policies.
 * Primarily called from server-side admin or onboarding.
 */
export const createTenant = async (data: Omit<Tenant, 'id'>): Promise<string> => {
    const tenantsRef = adminDb.ref(`${DB_PREFIX}/tenants`);
    const newTenantRef = tenantsRef.push();
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

    await adminDb.ref().update(updates);

    // Seed default approval policies for the new organization
    try {
        const { seedDefaultPolicies } = await import("./workflow/seed");
        await seedDefaultPolicies(tenantId);
        console.log(`[Tenant] Default approval policies seeded for ${tenantId}`);
    } catch (seedError) {
        console.error("[Tenant] Failed to seed default policies:", seedError);
    }

    return tenantId;
};

/**
 * Utility to backfill the registry from existing tenants.
 * Server-only operation.
 */
export const backfillTenantRegistry = async (): Promise<number> => {
    const snapshot = await adminDb.ref(`${DB_PREFIX}/tenants`).get();
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
        await adminDb.ref().update(updates);
    }
    return count;
};

/**
 * Updates tenant currency settings across all relevant paths.
 */
export const updateTenantCurrency = async (tenantId: string, currency: string) => {
    const updates: any = {};
    updates[`${DB_PREFIX}/tenants/${tenantId}/currency`] = currency;
    updates[`${DB_PREFIX}/tenants/${tenantId}/settings/baseCurrency`] = currency;
    updates[`${DB_PREFIX}/tenant_registry/${tenantId}/currency`] = currency;
    
    await adminDb.ref().update(updates);
};
