process.env.GCS_HTTP2_DISABLE = 'true';
import * as admin from 'firebase-admin';

// FORCE DISABLE HTTP/2 for GCS (Fixes ERR_STREAM_DESTROYED on Vercel)

let adminApp: admin.app.App | null = null;

function getAdminApp() {
    if (adminApp) return adminApp;
    
    if (admin.apps.length > 0) {
        adminApp = admin.app();
        return adminApp;
    }
    
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app";

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error("Firebase configuration environment variables are missing.");
    }

    try {
        // Robust Private Key Sanitization
        privateKey = privateKey.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
        if (!privateKey.includes("-----BEGIN")) {
            privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
        }

        adminApp = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
            storageBucket: bucketName
        });
        
        return adminApp;
    } catch (error: any) {
        console.error("[FirebaseAdmin] Initialization CRASH:", error.message);
        throw error;
    }
}

// STABLE EXPORTED INSTANCES
// These are standard, direct references initialized once.
export const adminAuth = getAdminApp().auth();
export const adminDb = getAdminApp().database();
export const adminStorage = getAdminApp().storage();

// Specific Bucket reference for ease of use
export const adminBucket = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app");

// Helper for raw access if needed
export const getAdminBucket = () => adminBucket;


