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

        // Verify requester's tenant and role (Must be Superuser)
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
            return NextResponse.json({ error: `Insufficient permissions. rawRole: ${rawRequesterRole}, mappedRole: ${mappedRole}` }, { status: 403 });
        }

        const body = await req.json();
        const { status } = body;

        if (!['active', 'suspended', 'pending'].includes(status)) {
            return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
        }

        // Update in DB
        const userRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/users/${uid}`);
        await userRef.update({ 
            status,
            isActive: status === 'active'
        });

        // Toggle Auth account if needed (Suspended users can't login)
        if (status === 'suspended') {
            await adminAuth.updateUser(uid, { disabled: true });
        } else if (status === 'active') {
            await adminAuth.updateUser(uid, { disabled: false });
        }

        return NextResponse.json({ success: true, status });
    } catch (error: any) {
        console.error("Error updating user status:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
