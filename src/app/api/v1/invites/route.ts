import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { createInvite, getPendingInvites } from "@/lib/invites";
import { DB_PREFIX } from "@/lib/firebase";
import { mapLegacyRole } from "@/lib/roles_config";

export async function POST(req: NextRequest) {
    if (!adminAuth || !adminDb) {
        return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
    }

    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            console.error("[Invite API] Error: No Bearer token provided");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("[Invite API] Step 1: Verifying ID Token...");
        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const requesterUid = decodedToken.uid;
        console.log(`[Invite API] Step 1 Success: UID=${requesterUid}`);

        // Verify requester's tenant and role
        console.log(`[Invite API] Step 2: Fetching tenant mapping for ${requesterUid}...`);
        const tenantMappingPath = `${DB_PREFIX}/userTenants/${requesterUid}`;
        const tenantMappingRef = adminDb.ref(tenantMappingPath);
        const tenantMappingSnap = await tenantMappingRef.get();
        
        if (!tenantMappingSnap.exists()) {
            console.error(`[Invite API] Step 2 Failed: No tenant mapping found at ${tenantMappingPath}`);
            return NextResponse.json({ 
                error: "Requester has no tenant mapping in the system.",
                debug: { path: tenantMappingPath, uid: requesterUid }
            }, { status: 403 });
        }

        const tenantData = tenantMappingSnap.val();
        const tenantId = tenantData.tenantId;
        console.log(`[Invite API] Step 2 Success: TenantId=${tenantId}`);
        
        if (!tenantId) {
            console.error(`[Invite API] Step 2 Failed: tenantId is missing in data`);
            return NextResponse.json({ error: "Invalid tenant mapping configuration." }, { status: 403 });
        }

        console.log(`[Invite API] Step 3: Fetching user profile from tenant ${tenantId}...`);
        const requesterPath = `${DB_PREFIX}/tenants/${tenantId}/users/${requesterUid}`;
        const requesterRef = adminDb.ref(requesterPath);
        const requesterSnap = await requesterRef.get();

        if (!requesterSnap.exists()) {
            console.error(`[Invite API] Step 3 Failed: User profile not found at ${requesterPath}`);
            return NextResponse.json({ 
                error: "User profile not found in your assigned tenant.",
                debug: { path: requesterPath }
            }, { status: 403 });
        }

        const requesterData = requesterSnap.val();
        const rawRequesterRole = requesterData.role || "UNKNOWN";
        const mappedRole = mapLegacyRole(rawRequesterRole);
        
        console.log(`[Invite API] Step 3 Success: RawRole=${rawRequesterRole}, MappedRole=${mappedRole}`);

        // In the new system, only administrator can invite
        console.log("[Invite API] Step 4: Checking authorization...");
        const normalizedRole = rawRequesterRole.toUpperCase();
        const isAuthorized = 
            mappedRole === 'administrator' || 
            normalizedRole === 'ADMIN' || 
            normalizedRole === 'ADMINISTRATOR' ||
            normalizedRole === 'SUPERUSER' ||
            normalizedRole === 'SUPERADMIN' ||
            normalizedRole === 'OWNER' ||
            normalizedRole === 'PLATFORM_SUPERUSER';
        
        if (!isAuthorized) {
            console.warn(`[Invite API] Step 4 Failed: Unauthorized role ${rawRequesterRole} (Mapped: ${mappedRole})`);
            return NextResponse.json({ 
                error: `Insufficient permissions. Status: Access Denied for role '${rawRequesterRole}'.`,
                debug: { 
                    uid: requesterUid,
                    rawRole: rawRequesterRole, 
                    mappedRole: mappedRole,
                    tenantId: tenantId
                }
            }, { status: 403 });
        }

        console.log("[Invite API] Step 5: Parsing request body...");
        const body = await req.json();
        const { name, email, role, department, expiresInHours } = body;

        if (!name || !role || !department) {
            console.error("[Invite API] Step 5 Failed: Missing required fields", { name: !!name, role: !!role, dept: !!department });
            return NextResponse.json({ error: "Name, Role, and Department are required" }, { status: 400 });
        }

        console.log(`[Invite API] Step 6: Creating invite for ${name} (${role})...`);
        const invite = await createInvite({
            tenantId,
            invitedName: name,
            invitedEmail: email || null,
            role,
            department,
            expiresInHours: expiresInHours || 48,
            createdBy: requesterUid
        });

        console.log("[Invite API] SUCCESS: Invite created", { inviteId: invite.id });
        return NextResponse.json(invite);
    } catch (error: any) {
        console.error("[Invite API] CRITICAL ERROR:", error);
        return NextResponse.json({ 
            error: error.message || "Internal server error",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }

}

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const requesterUid = decodedToken.uid;

        const tenantMappingRef = adminDb!.ref(`${DB_PREFIX}/userTenants/${requesterUid}`);
        const tenantMappingSnap = await tenantMappingRef.get();
        const tenantId = tenantMappingSnap.val().tenantId;

        const invites = await getPendingInvites(tenantId);
        return NextResponse.json(invites);
    } catch (error: any) {
        console.error("Error listing invites:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
