import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { revokeInvite } from "@/lib/invites";
import { DB_PREFIX } from "@/lib/firebase";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        const tenantMappingRef = adminDb.ref(`${DB_PREFIX}/userTenants/${requesterUid}`);
        const tenantMappingSnap = await tenantMappingRef.get();
        if (!tenantMappingSnap.exists()) {
            return NextResponse.json({ error: "Requester has no tenant" }, { status: 403 });
        }

        const tenantId = tenantMappingSnap.val().tenantId;
        const { id } = await params;
        const inviteId = id;

        await revokeInvite(tenantId, inviteId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error revoking invite:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
