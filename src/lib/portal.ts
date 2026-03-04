import { db, DB_PREFIX } from "./firebase";
import { ref, set, get, update } from "firebase/database";
import { PortalSession, Vendor } from "@/types";

export const generatePortalLink = async (providedTenantId: string, vendorId: string): Promise<string> => {
    let tenantId = providedTenantId;
    try {
        // Fallback: if tenantId is missing, try to get it from auth (v2 safety)
        if (!tenantId || tenantId === 'undefined') {
            const { auth } = await import("./firebase");
            const user = auth.currentUser;
            if (user) {
                // We'd ideally need a way to get the tenantId from the current session
                // For now, we assume providedTenantId is usually correct or passed from context
                console.warn("[Portal] Missing tenantId, attempting to continue with provided:", tenantId);
            }
        }

        const token = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID().replace(/-/g, '')
            : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const session: any = {
            token,
            vendorId,
            tenantId,
            vendorName: "",
            expiresAt: expiresAt.toISOString()
        };

        const sessionPath = `${DB_PREFIX}/portalSessions/${token}`;
        const vendorPath = `${DB_PREFIX}/tenants/${tenantId}/vendors/${vendorId}`;

        console.log(`[Portal] Generating link for vendor ${vendorId} in tenant ${tenantId}`);
        console.log(`[Portal] Writing session to: ${sessionPath}`);

        await set(ref(db, sessionPath), session);

        console.log(`[Portal] Session created, updating vendor metadata at: ${vendorPath}`);

        await update(ref(db, vendorPath), {
            portalToken: token,
            portalTokenExpiry: expiresAt.toISOString() // Store as ISO string for consistency
        });

        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        return `${baseUrl}/portal/${token}`;
    } catch (error: any) {
        console.error("[Portal] Error generating secure link:", error);
        if (error.code === 'PERMISSION_DENIED') {
            console.error(`[Portal] Permission denied. Check rules for ${DB_PREFIX}/portalSessions or ${DB_PREFIX}/tenants/${tenantId || providedTenantId}/vendors`);
        }
        throw error;
    }
};

export const validatePortalToken = async (token: string): Promise<PortalSession | null> => {
    const sessionRef = ref(db, `${DB_PREFIX}/portalSessions/${token}`);
    const snapshot = await get(sessionRef);

    if (!snapshot.exists()) return null;

    const session = snapshot.val() as PortalSession;

    if (new Date(session.expiresAt) < new Date()) return null;

    // Fetch vendor name — requires tenantId to be stored in session
    if (session.tenantId) {
        const vendorSnap = await get(ref(db, `${DB_PREFIX}/tenants/${session.tenantId}/vendors/${session.vendorId}`));
        if (vendorSnap.exists()) {
            session.vendorName = vendorSnap.val().name;
        }
    }

    return session;
};
