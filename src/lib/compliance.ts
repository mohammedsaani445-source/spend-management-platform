import { db, DB_PREFIX } from "./firebase";
import { ref, remove, get } from "firebase/database";

/**
 * COMPLIANCE GATEWAY (GDPR, ISO 27001).
 */
export class ComplianceGateway {

    static async handleForgetMeRequest(tenantId: string, userId: string) {
        console.log(`[Compliance] Initiating GDPR 'Right to be Forgotten' for user ${userId}`);

        const paths = [
            `${DB_PREFIX}/tenants/${tenantId}/users/${userId}`,
            `${DB_PREFIX}/userTenants/${userId}`
        ];

        for (const path of paths) {
            await remove(ref(db, path));
        }

        const { logImmutableAction } = await import("./audit_chain");
        await logImmutableAction(tenantId, {
            actorId: 'COMPLIANCE_SYSTEM',
            actorName: 'GDPR Automator',
            action: 'DELETE',
            entityType: 'USER',
            entityId: userId,
            description: "Executed 'Right to be Forgotten' deletion request (GDPR)."
        });
    }

    static async generateAccessReview(tenantId: string) {
        const usersRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/users`);
        const snap = await get(usersRef);

        if (!snap.exists()) return [];

        return Object.values(snap.val()).map((u: any) => ({
            uid: u.uid,
            name: u.displayName,
            role: u.role,
            lastLogin: u.lastLoginAt || 'N/A',
            isActive: u.isActive
        }));
    }
}
