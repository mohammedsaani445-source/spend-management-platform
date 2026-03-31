import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { DB_PREFIX } from "@/lib/firebase";
import { Invite, AppUser, UserRole } from "@/types";

/**
 * POST /api/v1/invites/complete
 * Finalizes the onboarding flow by creating the user record and linking it to the tenant.
 */
export async function POST(req: NextRequest) {
    try {
        const { uid, email, token, displayName } = await req.json();

        if (!uid || !token) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // 1. Validate Token mapping again to be safe
        const tokenRef = adminDb.ref(`${DB_PREFIX}/inviteTokens/${token}`);
        const tokenSnap = await tokenRef.once('value');

        if (!tokenSnap.exists()) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
        }

        const { tenantId, inviteId } = tokenSnap.val();

        // 2. Fetch Invite
        const inviteRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/invites/${inviteId}`);
        const inviteSnap = await inviteRef.once('value');

        if (!inviteSnap.exists()) {
            return NextResponse.json({ error: "Invite not found" }, { status: 404 });
        }

        const invite = inviteSnap.val() as Invite;

        if (invite.used) {
            return NextResponse.json({ error: "Invite already used" }, { status: 400 });
        }

        // 2.5 Email Mismatch Check (if invite was restricted to an email)
        if (invite.invited_email && email && invite.invited_email.toLowerCase() !== email.toLowerCase()) {
            return NextResponse.json({ 
                error: `This invitation was restricted to ${invite.invited_email}. Current session: ${email}` 
            }, { status: 403 });
        }

        // 3. Create User Profile in the Tenant
        const userRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/users/${uid}`);
        
        const newUser: AppUser = {
            uid,
            tenantId,
            email: email || invite.invited_email || "",
            displayName: displayName || invite.invited_name,
            role: invite.role,
            department: invite.department,
            userType: 'PRO',
            isActive: true,
            status: 'active',
            createdAt: new Date(),
            twoFactorEnabled: false,
            marketingEmails: true,
            securityAlerts: true
        };

        // 4. Atomic Updates
        const updates: any = {};
        
        // Save user profile
        updates[`${DB_PREFIX}/tenants/${tenantId}/users/${uid}`] = {
            ...newUser,
            createdAt: newUser.createdAt.toISOString() // Real DB stores string
        };
        
        // Set user-tenant mapping
        updates[`${DB_PREFIX}/userTenants/${uid}`] = { tenantId };
        
        // Mark invite as used
        updates[`${DB_PREFIX}/tenants/${tenantId}/invites/${inviteId}/used`] = true;
        updates[`${DB_PREFIX}/tenants/${tenantId}/invites/${inviteId}/used_at`] = new Date().toISOString();
        
        // Remove individual token lookup (keep it clean)
        updates[`${DB_PREFIX}/inviteTokens/${token}`] = null;

        await adminDb.ref().update(updates);

        return NextResponse.json({ success: true, user: newUser });

    } catch (error: any) {
        console.error("[Invite Completion Error]:", error);
        return NextResponse.json({ error: "Failed to finalize account" }, { status: 500 });
    }
}
