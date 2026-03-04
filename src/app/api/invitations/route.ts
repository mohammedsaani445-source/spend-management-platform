import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { Resend } from "resend";

const DB_PREFIX = "v2_production";
const resend = new Resend(process.env.RESEND_API_KEY || "fallback_key");

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

        const requesterRole = requesterSnap.val().role;
        if (requesterRole !== 'ADMIN' && requesterRole !== 'SUPERUSER') {
            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
        }

        // Get invitation details
        const { email, displayName, role, departmentId, locationId, managerId } = await req.json();

        if (!email || !role) {
            return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
        }

        // 1. Create or fetch Firebase Auth user
        let userRecord;
        let isNewUser = false;
        try {
            userRecord = await adminAuth.getUserByEmail(email);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                // Generate a temporary random password
                const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
                userRecord = await adminAuth.createUser({
                    email,
                    displayName,
                    password: tempPassword,
                });
                isNewUser = true;
            } else {
                throw error;
            }
        }

        // 2. Add user to the tenant directory
        const newUserRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/users/${userRecord.uid}`);
        await newUserRef.set({
            email: userRecord.email,
            displayName: displayName || userRecord.displayName || "Invited User",
            role: role,
            departmentId: departmentId || null,
            locationId: locationId || null,
            managerId: managerId || null,
            isActive: true,
            createdAt: Date.now()
        });

        // 3. Map user to the tenant globally
        await adminDb.ref(`${DB_PREFIX}/userTenants/${userRecord.uid}`).set({
            tenantId: tenantId
        });

        // 4. Send Invitation Email (Magic Link / Password Reset)
        const actionCodeSettings = {
            // URL you want to redirect back to. The domain (www.example.com) for this
            // URL must be in the authorized domains list in the Firebase Console.
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
            handleCodeInApp: true,
        };

        let resetLink;
        try {
            console.log("[DEBUG] generating password reset link for", email);
            console.log("[DEBUG] FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
            console.log("[DEBUG] FIREBASE_CLIENT_EMAIL exists?", !!process.env.FIREBASE_CLIENT_EMAIL);
            console.log("[DEBUG] FIREBASE_PRIVATE_KEY exists?", !!process.env.FIREBASE_PRIVATE_KEY);
            resetLink = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
        } catch (err: any) {
            console.warn("[Dev Mode] Admin SDK could not generate reset link. Using Auth Mock URL.", err.message);
            resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?mock_invite=true`;
        }

        // Try to send the email via Resend if configured
        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: 'Invitations <invites@your-domain.com>', // Replace with your verified sender
                to: [email],
                subject: `You've been invited to join Megapex Spend Management`,
                html: `
                    <h2>Welcome to Megapex</h2>
                    <p>You have been invited by ${requesterSnap.val().displayName || 'an admin'} to join their workspace.</p>
                    <p>Click the link below to set your password and access your account:</p>
                    <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #e8572a; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
                    <p>If you already have an account, you can <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login">log in here</a>.</p>
                `
            });
        } else {
            console.log(`[DEV MODE] Invitation generated. Send this link to the user to setup password: ${resetLink}`);
        }

        return NextResponse.json({
            success: true,
            message: "User invited successfully",
            uid: userRecord.uid,
            isNewUser
        });

    } catch (error: any) {
        console.error("Error inviting user:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
