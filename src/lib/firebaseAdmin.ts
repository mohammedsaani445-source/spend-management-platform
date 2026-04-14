import * as admin from 'firebase-admin';

/**
 * FIREBASE ADMIN SDK (SERVER-SIDE ONLY)
 * Optimized for robustness to prevent hangs during initialization.
 */
function getAdminApp() {
    console.log("[FirebaseAdmin] getAdminApp() called.");
    
    // 1. If already initialized, return the app
    if (admin.apps.length > 0) {
        return admin.app();
    }
    
    console.log("[FirebaseAdmin] Initializing new Firebase Admin instance...");

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app";

    if (!projectId || !clientEmail || !privateKey) {
        console.error("[FirebaseAdmin] Missing setup in .env.local!");
        throw new Error("Firebase configuration environment variables are missing.");
    }

    try {
        // Essential: Handle escaped newlines and PEM formatting
        // This is the #1 cause of hangs in Node.js
        console.log("[FirebaseAdmin] Sanitizing Private Key...");
        
        // Remove surrounding quotes if they exist (Vercel sometimes adds them)
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.substring(1, privateKey.length - 1);
        }
        
        // Handle double-escaped newlines and standard ones
        privateKey = privateKey.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
        
        // Ensure it has PEM headers if they are missing
        if (!privateKey.includes("-----BEGIN")) {
            console.warn("[FirebaseAdmin] Private key missing headers. Adding them...");
            privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
        }

        console.log("[FirebaseAdmin] Attempting app initialization with project:", projectId);
        const app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
            storageBucket: bucketName
        });
        
        console.log("[FirebaseAdmin] Success: App initialized.");
        return app;
    } catch (error: any) {
        console.error("[FirebaseAdmin] Initialization CRASH:", error.message);
        throw error;
    }
}

// Exported high-level utilities
export const adminDb = {
    get ref() { return getAdminApp().database().ref.bind(getAdminApp().database()); }
} as any;

export const adminAuth = {
    getUser: (uid: string) => getAdminApp().auth().getUser(uid),
    verifyIdToken: (token: string) => getAdminApp().auth().verifyIdToken(token)
} as any;

export const adminStorage = {
    bucket: (name?: string) => getAdminApp().storage().bucket(name || process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app")
} as any;

// The main utility for our handlers
export const adminBucket = new Proxy({} as any, {
    get: (target, prop) => {
        try {
            const bucket = getAdminApp().storage().bucket(process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app");
            return (bucket as any)[prop];
        } catch (e) {
            console.error("[FirebaseAdmin] adminBucket proxy access failed:", prop);
            throw e;
        }
    }
});
