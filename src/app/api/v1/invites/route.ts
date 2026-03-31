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
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const requesterUid = decodedToken.uid;

        // Verify requester's tenant and role
        const tenantMappingPath = `${DB_PREFIX}/userTenants/${requesterUid}`;
        const tenantMappingRef = adminDb.ref(tenantMappingPath);
        const tenantMappingSnap = await tenantMappingRef.get();
        
        if (!tenantMappingSnap.exists()) {
            console.error(`[Invite API] No tenant mapping found at ${tenantMappingPath} for user ${requesterUid}`);
            return NextResponse.json({ 
                error: "Requester has no tenant mapping in the system.",
                debug: { path: tenantMappingPath, uid: requesterUid }
            }, { status: 403 });
        }

        const tenantData = tenantMappingSnap.val();
        const tenantId = tenantData.tenantId;
        
        if (!tenantId) {
            console.error(`[Invite API] Tenant mapping exists but tenantId is missing for user ${requesterUid}`);
            return NextResponse.json({ error: "Invalid tenant mapping configuration." }, { status: 403 });
        }

        const requesterPath = `${DB_PREFIX}/tenants/${tenantId}/users/${requesterUid}`;
        const requesterRef = adminDb.ref(requesterPath);
        const requesterSnap = await requesterRef.get();

        if (!requesterSnap.exists()) {
            console.error(`[Invite API] User profile not found at ${requesterPath}`);
            return NextResponse.json({ 
                error: "User profile not found in your assigned tenant.",
                debug: { path: requesterPath }
            }, { status: 403 });
        }

        const requesterData = requesterSnap.val();
        const rawRequesterRole = requesterData.role || "UNKNOWN";
        const mappedRole = mapLegacyRole(rawRequesterRole);
        
        console.log(`[Invite API] Auth Check: UID=${requesterUid}, Tenant=${tenantId}, RawRole=${rawRequesterRole}, MappedRole=${mappedRole}`);

        // In the new system, only administrator can invite
        // We check both the mapped role and the raw role to be safe
        const isAuthorized = 
            mappedRole === 'administrator' || 
            rawRequesterRole === 'ADMIN' || 
            rawRequesterRole === 'administrator' ||
            rawRequesterRole === 'SUPERUSER' ||
            rawRequesterRole === 'PLATFORM_SUPERUSER';
        
        if (!isAuthorized) {
            console.warn(`[Invite API] Unauthorized invitation attempt by ${requesterUid} (Role: ${rawRequesterRole}, Mapped: ${mappedRole})`);
            return NextResponse.json({ 
                error: `Insufficient permissions to generate invites. Requester role '${rawRequesterRole}' does not have administrative privileges.`,
                debug: { 
                    uid: requesterUid,
                    rawRole: rawRequesterRole, 
                    mappedRole: mappedRole,
                    tenantId: tenantId
                }
            }, { status: 403 });
        }

        const body = await req.json();
        const { name, email, role, department, expiresInHours } = body;

        if (!name || !role || !department) {
            return NextResponse.json({ error: "Name, Role, and Department are required" }, { status: 400 });
        }

        const invite = await createInvite({
            tenantId,
            invitedName: name,
            invitedEmail: email || null,
            role,
            department,
            expiresInHours: expiresInHours || 48,
            createdBy: requesterUid
        });

        return NextResponse.json(invite);
    } catch (error: any) {
        console.error("Error creating invite:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
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
