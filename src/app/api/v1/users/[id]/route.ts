import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { DB_PREFIX } from "@/lib/firebase";
import { mapLegacyRole } from "@/lib/roles_config";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: uid } = await params;

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

        // Verify requester's tenant and role (Must be Superuser/administrator)
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
        
        if (mappedRole !== 'administrator') {
            return NextResponse.json({ error: `Insufficient permissions. Administrator required.` }, { status: 403 });
        }

        const body = await req.json();
        const { name, role, department } = body;

        if (!name || !role || !department) {
            return NextResponse.json({ error: "Missing required fields: name, role, and department are required." }, { status: 400 });
        }

        // Ensure we are updating the user within the same tenant
        const userRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/users/${uid}`);
        const targetUserSnap = await userRef.get();
        if (!targetUserSnap.exists()) {
            return NextResponse.json({ error: "Target user not found" }, { status: 404 });
        }

        await userRef.update({ 
            name,
            role,
            department,
            updatedAt: new Date().toISOString()
        });

        // Also update Auth profile displayName if possible
        await adminAuth.updateUser(uid, { displayName: name });

        return NextResponse.json({ success: true, user: { uid, name, role, department } });
    } catch (error: any) {
        console.error("Error updating user details:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
