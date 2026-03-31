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
        const tenantMappingRef = adminDb.ref(`${DB_PREFIX}/userTenants/${requesterUid}`);
        const tenantMappingSnap = await tenantMappingRef.get();
        if (!tenantMappingSnap.exists()) {
            return NextResponse.json({ error: "Requester has no tenant" }, { status: 403 });
        }

        const tenantId = tenantMappingSnap.val().tenantId;
        const requesterRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/users/${requesterUid}`);
        const requesterSnap = await requesterRef.get();

        if (!requesterSnap.exists()) {
            return NextResponse.json({ error: "Requester not found in tenant" }, { status: 403 });
        }

        const rawRequesterRole = requesterSnap.val().role;
        const mappedRole = mapLegacyRole(rawRequesterRole);
        // In the new system, only administrator can invite
        if (mappedRole !== 'administrator') {
            return NextResponse.json({ error: `Insufficient permissions. rawRole: ${rawRequesterRole}, mappedRole: ${mappedRole}` }, { status: 403 });
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
