"use server";

import { 
    updateTenantCurrency as serverUpdateTenantCurrency,
    backfillTenantRegistry as serverBackfillTenantRegistry 
} from "@/lib/tenants.server";
import { revalidatePath } from "next/cache";

/**
 * Server Action to update tenant currency settings.
 */
export async function updateTenantCurrencyAction(tenantId: string, currency: string) {
    try {
        await serverUpdateTenantCurrency(tenantId, currency);
        
        // Revalidate the settings page to show updated data
        revalidatePath("/admin/settings");
        revalidatePath("/settings");
        
        return { success: true };
    } catch (error) {
        console.error("Failed to update tenant currency:", error);
        return { success: false, error: "Internal Server Error" };
    }
}

/**
 * Server Action to backfill the tenant registry from the raw tenants path.
 * Should only be called by system administrators.
 */
export async function backfillTenantRegistryAction() {
    try {
        const count = await serverBackfillTenantRegistry();
        revalidatePath("/admin/approvals");
        return { success: true, count };
    } catch (error) {
        console.error("Failed to backfill tenant registry:", error);
        return { success: false, error: "Internal Server Error" };
    }
}
