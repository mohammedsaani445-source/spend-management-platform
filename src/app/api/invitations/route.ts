import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
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
        if (!['ADMIN', 'WORKSPACE_ADMIN', 'PLATFORM_SUPERUSER'].includes(requesterRole)) {
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
        let emailSent = false;
        const resendKey = process.env.RESEND_API_KEY;
        const hasValidResendKey = resendKey && resendKey !== "fallback_key" && !resendKey.includes("YOUR_");

        if (hasValidResendKey) {
            try {
                await resend.emails.send({
                    from: process.env.EMAIL_FROM || 'Apexprocure <onboarding@resend.dev>',
                    to: [email],
                    subject: `You've been invited to join Apexprocure Spend Management`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                            <h2 style="color: #1e293b; margin-bottom: 16px;">Welcome to Apexprocure</h2>
                            <p style="color: #475569; line-height: 1.6;">You have been invited by <strong>${requesterSnap.val().displayName || 'an admin'}</strong> to join their workspace.</p>
                            <p style="color: #475569; line-height: 1.6; margin-bottom: 24px;">Click the button below to set your password and access your account:</p>
                            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #e8572a; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Accept Invitation</a>
                            <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                            <p style="font-size: 12px; color: #94a3b8;">If the button doesn't work, copy and paste this link into your browser:</p>
                            <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">${resetLink}</p>
                        </div>
                    `
                });
                emailSent = true;
                console.log(`[SUCCESS] Invitation email sent to ${email}`);
            } catch (emailError) {
                console.error("[ERROR] Failed to send email via Resend:", emailError);
            }
        } else {
            console.log(`[DEV MODE] Resend API key missing or invalid. Invitation generated but NOT sent via email.`);
            console.log(`[DEV LINK] ${resetLink}`);
        }

        return NextResponse.json({
            success: true,
            message: "User invited successfully",
            uid: userRecord.uid,
            isNewUser,
            emailSent
        });

    } catch (error: any) {
        console.error("Error inviting user:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
