import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { DB_PREFIX } from "@/lib/firebase";
import { Invite, UserRole } from "@/types";

export async function POST(req: NextRequest) {
    if (!adminAuth || !adminDb) {
        return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
    }

    try {
        const { token, code } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Invite token is required" }, { status: 400 });
        }

        // 1. Verify Authentication
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "You must be signed in to join" }, { status: 401 });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const email = decodedToken.email;

        // 2. Validate Token via Index
        const tokenIndexRef = adminDb.ref(`${DB_PREFIX}/inviteTokens/${token}`);
        const tokenSnap = await tokenIndexRef.get();

        if (!tokenSnap.exists()) {
            return NextResponse.json({ error: "Invalid or expired invitation link" }, { status: 404 });
        }

        const { tenantId, inviteId } = tokenSnap.val();
        const inviteRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/invites/${inviteId}`);
        const inviteSnap = await inviteRef.get();

        if (!inviteSnap.exists()) {
            return NextResponse.json({ error: "Invitation record not found" }, { status: 404 });
        }

        const invite: Invite = inviteSnap.val();

        // 3. Security Checks
        if (invite.used) {
            return NextResponse.json({ error: "This invitation has already been used" }, { status: 400 });
        }

        if (new Date(invite.expires_at) < new Date()) {
            return NextResponse.json({ error: "This invitation has expired" }, { status: 400 });
        }

        // 4. Verify Access Code (if required)
        if (invite.code && invite.code !== code) {
            return NextResponse.json({ error: "Invalid security code" }, { status: 400 });
        }

        // 5. Verify Email Match (if restricted)
        if (invite.invited_email && invite.invited_email.toLowerCase() !== email?.toLowerCase()) {
            return NextResponse.json({ error: `This invitation was intended for ${invite.invited_email}` }, { status: 403 });
        }

        // 6. Perform Enrollment (Atomic updates)
        const updates: any = {};
        
        // Mark invite as used
        updates[`${DB_PREFIX}/tenants/${tenantId}/invites/${inviteId}/used`] = true;
        updates[`${DB_PREFIX}/tenants/${tenantId}/invites/${inviteId}/used_at`] = new Date().toISOString();
        updates[`${DB_PREFIX}/tenants/${tenantId}/invites/${inviteId}/used_by`] = uid;
        
        // Remove from token index
        updates[`${DB_PREFIX}/inviteTokens/${token}`] = null;

        // Add user to tenant members
        updates[`${DB_PREFIX}/tenants/${tenantId}/users/${uid}`] = {
            displayName: decodedToken.name || invite.invited_name,
            email: email,
            photoURL: decodedToken.picture || null,
            role: invite.role,
            department: invite.department || "General",
            status: 'active',
            joinedAt: new Date().toISOString()
        };

        // Update user-to-tenant lookup
        updates[`${DB_PREFIX}/userTenants/${uid}`] = {
            tenantId: tenantId,
            role: invite.role,
            status: 'active'
        };

        await adminDb.ref().update(updates);

        // 7. Optional: Update Custom Claims for backend security
        await adminAuth.setCustomUserClaims(uid, {
            tenantId: tenantId,
            role: invite.role
        });

        return NextResponse.json({ 
            success: true, 
            message: "Successfully joined organization",
            tenantId,
            role: invite.role
        });

    } catch (error: any) {
        console.error("Error consuming invite:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
