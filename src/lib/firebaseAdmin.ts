import * as admin from 'firebase-admin';

/**
 * FIREBASE ADMIN SDK (SERVER-SIDE ONLY)
 * Optimized for robustness to prevent hangs during initialization.
 */
/**
 * FIREBASE ADMIN SDK (SERVER-SIDE ONLY)
 * Optimized for robustness to prevent hangs and "this context" errors in production.
 */
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
        // Sanitization
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.substring(1, privateKey.length - 1);
        }
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

// Clean Exports that preserve "this" context
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

/**
 * Shared Bucket Instance (Proxy)
 * Correctly binds properties to the bucket instance to prevent "this context" errors.
 */
export const adminBucket = new Proxy({} as any, {
    get: (target, prop) => {
        const bucket = getAdminApp().storage().bucket(process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app");
        const value = (bucket as any)[prop];
        if (typeof value === 'function') {
            return value.bind(bucket);
        }
        return value;
    }
});


