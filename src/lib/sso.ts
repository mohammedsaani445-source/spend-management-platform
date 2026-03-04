import { auth } from "./firebase";
import { SAMLAuthProvider, signInWithPopup } from "firebase/auth";

/**
 * ENTERPRISE SSO SERVICE (Okta/Azure AD/SAML).
 * Manages the connection and authentication via external Identity Providers (IdP).
 */
export class SsoService {
    /**
     * Initiates the SAML Login flow for a specific enterprise tenant.
     */
    static async loginWithSso(providerId: string) {
        try {
            // providerId should match the ID configured in the Firebase Console
            // e.g., 'saml.okta-tenant-1'
            const provider = new SAMLAuthProvider(providerId);
            const result = await signInWithPopup(auth, provider);

            console.log(`[SSO] Successfully authenticated user ${result.user.email} via IdP ${providerId}`);
            return result.user;
        } catch (error) {
            console.error("[SSO] Authentication failed:", error);
            throw error;
        }
    }

    /**
     * PRODUCTION REALIZATION: Enterprise Config Bridge.
     * In a full enterprise environment, each tenant would have their own
     * metadata URL and SSO certificate stored in the DB.
     */
    static async getTenantSsoConfig(tenantId: string) {
        // Fetch from /tenants/$id/settings/sso
        return {
            enabled: true,
            providerId: `saml.ent-${tenantId}`,
            idpEntityId: "https://okta.com/exk...",
            ssoUrl: "https://okta.com/app/...",
        };
    }
}
