import { adminDb } from "@/lib/firebaseAdmin";
import { DB_PREFIX } from "@/lib/firebase";
import { Invite, UserRole } from "@/types";
import crypto from "crypto";

const getInvitesRef = (tenantId: string) => adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/invites`);
const getInviteRef = (tenantId: string, inviteId: string) => adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/invites/${inviteId}`);

/**
 * Generates a new invite and stores it in the database.
 */
export const createInvite = async (params: {
    tenantId: string;
    invitedName: string;
    invitedEmail?: string | null;
    role: UserRole;
    department: string;
    expiresInHours: number;
    createdBy: string;
}): Promise<Invite> => {
    try {
        const invitesRef = getInvitesRef(params.tenantId);
        const newInviteRef = invitesRef.push();
        const inviteId = newInviteRef.key!;
        
        // 1. Generate unique cryptographic token
        const token = crypto.randomBytes(32).toString('hex');

        // 2. Generate human-readable access code (AP-XXXXXX)
        const code = 'AP-' + Math.floor(100000 + Math.random() * 900000);

        // 3. Calculate expiry
        const expiresAt = new Date(Date.now() + params.expiresInHours * 3600 * 1000).toISOString();

        const invite: Invite = {
            id: inviteId,
            org_id: params.tenantId,
            token,
            code,
            invited_name: params.invitedName,
            invited_email: params.invitedEmail || null,
            role: params.role,
            department: params.department,
            expires_at: expiresAt,
            used: false,
            created_by: params.createdBy,
            created_at: new Date().toISOString()
        };

        const updates: any = {};
        updates[`${DB_PREFIX}/tenants/${params.tenantId}/invites/${inviteId}`] = invite;
        updates[`${DB_PREFIX}/inviteTokens/${token}`] = { tenantId: params.tenantId, inviteId };
        updates[`${DB_PREFIX}/inviteCodes/${code}`] = { tenantId: params.tenantId, inviteId };
        
        await adminDb.ref().update(updates);
        return invite;
    } catch (error) {
        console.error("Error creating invite:", error);
        throw error;
    }
};

/**
 * Validates an invite token.
 */
export const validateInviteToken = async (tenantId: string, token: string): Promise<Invite | null> => {
    try {
        const invitesRef = getInvitesRef(tenantId);
        const q = invitesRef.orderByChild('token').equalTo(token);
        const snapshot = await q.once('value');

        if (snapshot.exists()) {
            const data = snapshot.val();
            const invite: Invite = Object.values(data)[0] as Invite;

            // Check if used or expired
            if (invite.used) return null;
            if (new Date(invite.expires_at) < new Date()) return null;

            return invite;
        }
        return null;
    } catch (error) {
        console.error("Error validating invite token:", error);
        return null;
    }
};

/**
 * Validates an invite code.
 */
export const validateInviteCode = async (tenantId: string, code: string, email?: string): Promise<Invite | null> => {
    try {
        const invitesRef = getInvitesRef(tenantId);
        const q = invitesRef.orderByChild('code').equalTo(code);
        const snapshot = await q.once('value');

        if (snapshot.exists()) {
            const data = snapshot.val();
            const invite: Invite = Object.values(data)[0] as Invite;

            // Check if used or expired
            if (invite.used) return null;
            if (new Date(invite.expires_at) < new Date()) return null;
            
            // If email is provided, check if it matches the invited email (if the invited email was set)
            if (email && invite.invited_email && invite.invited_email.toLowerCase() !== email.toLowerCase()) {
                return null;
            }

            return invite;
        }
        return null;
    } catch (error) {
        console.error("Error validating invite code:", error);
        return null;
    }
};

/**
 * Marks an invite as used.
 */
export const markInviteUsed = async (tenantId: string, inviteId: string) => {
    try {
        const inviteRef = getInviteRef(tenantId, inviteId);
        await inviteRef.update({
            used: true,
            used_at: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error marking invite used:", error);
        throw error;
    }
};

/**
 * Lists all pending invites for a tenant.
 */
export const getPendingInvites = async (tenantId: string): Promise<Invite[]> => {
    try {
        const invitesRef = getInvitesRef(tenantId);
        const snapshot = await invitesRef.once('value');
        if (snapshot.exists()) {
            const data = snapshot.val();
            return (Object.values(data) as Invite[]).filter(i => !i.used && new Date(i.expires_at) > new Date());
        }
        return [];
    } catch (error) {
        console.error("Error fetching pending invites:", error);
        throw error;
    }
};

/**
 * Revokes an invite.
 */
export const revokeInvite = async (tenantId: string, inviteId: string) => {
    try {
        const inviteRef = getInviteRef(tenantId, inviteId);
        const snapshot = await inviteRef.once('value');
        if (snapshot.exists()) {
            const invite: Invite = snapshot.val();
            const updates: any = {};
            updates[`${DB_PREFIX}/tenants/${tenantId}/invites/${inviteId}/expires_at`] = new Date(0).toISOString();
            updates[`${DB_PREFIX}/inviteTokens/${invite.token}`] = null;
            updates[`${DB_PREFIX}/inviteCodes/${invite.code}`] = null;
            await adminDb.ref().update(updates);
        }
    } catch (error) {
        console.error("Error revoking invite:", error);
        throw error;
    }
};
