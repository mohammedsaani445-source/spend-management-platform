import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { DB_PREFIX } from "@/lib/firebase";
import { Invite } from "@/types";

/**
 * POST /api/v1/invites/validate
 * Validates either a magic link token or an access code.
 */
export async function POST(req: NextRequest) {
    try {
        const { token, code, email } = await req.json();

        if (!token && !code) {
            return NextResponse.json({ error: "Missing token or code" }, { status: 400 });
        }

        let invite: Invite | null = null;
        let tenantId: string | null = null;

        if (token) {
            // Validate via Token
            const tokenRef = adminDb.ref(`${DB_PREFIX}/inviteTokens/${token}`);
            const tokenSnap = await tokenRef.once('value');

            if (!tokenSnap.exists()) {
                return NextResponse.json({ error: "Invalid or expired magic link" }, { status: 404 });
            }

            const mapping = tokenSnap.val();
            tenantId = mapping.tenantId;
            const inviteId = mapping.inviteId;

            const inviteRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/invites/${inviteId}`);
            const inviteSnap = await inviteRef.once('value');
            
            if (inviteSnap.exists()) {
                invite = inviteSnap.val() as Invite;
            }
        } else if (code) {
            // Validate via Access Code using the global registry
            const codeRef = adminDb.ref(`${DB_PREFIX}/inviteCodes/${code}`);
            const codeSnap = await codeRef.once('value');

            if (!codeSnap.exists()) {
                return NextResponse.json({ error: "Invalid or expired access code" }, { status: 404 });
            }

            const mapping = codeSnap.val();
            tenantId = mapping.tenantId;
            const inviteId = mapping.inviteId;

            const inviteRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/invites/${inviteId}`);
            const inviteSnap = await inviteRef.once('value');
            
            if (inviteSnap.exists()) {
                invite = inviteSnap.val() as Invite;
            }
        }

        if (!invite) {
            return NextResponse.json({ error: "Invite not found" }, { status: 404 });
        }

        // Check if used or expired
        if (invite.used) {
            return NextResponse.json({ error: "This invite has already been used" }, { status: 400 });
        }

        if (new Date(invite.expires_at) < new Date()) {
            return NextResponse.json({ error: "This invite has expired" }, { status: 400 });
        }

        // Email check if provided in invite
        if (email && invite.invited_email && invite.invited_email.toLowerCase() !== email.toLowerCase()) {
            return NextResponse.json({ error: "Email verification mismatch" }, { status: 403 });
        }

        return NextResponse.json({ 
            valid: true, 
            invite: {
                id: invite.id,
                org_id: invite.org_id,
                invited_name: invite.invited_name,
                role: invite.role,
                department: invite.department,
                invited_email: invite.invited_email
            }
        });

    } catch (error: any) {
        console.error("[Invite Validation Error]:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
