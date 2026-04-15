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

// SINGLETON INSTANCES
let firestore: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;
let storage: admin.storage.Storage | null = null;
let rtdb: admin.database.Database | null = null;

// EXPORTED GETTERS (Preserves backward compatibility with existing code)
export const adminDb = {
    get ref() {
        const app = getAdminApp();
        if (!rtdb) rtdb = app.database();
        return rtdb.ref.bind(rtdb);
    }
} as any;

export const adminAuth = {
    getUser: (uid: string) => {
        if (!auth) auth = getAdminApp().auth();
        return auth.getUser(uid);
    },
    verifyIdToken: (token: string) => {
        if (!auth) auth = getAdminApp().auth();
        return auth.verifyIdToken(token);
    }
} as any;

export const adminStorage = {
    bucket: (name?: string) => {
        if (!storage) storage = getAdminApp().storage();
        return storage.bucket(name || process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app");
    }
} as any;

/**
 * adminBucket: A truly stable Reference
 * This is now the actual Bucket object, initialized lazily.
 */
export const adminBucket = {
    get name() { return adminStorage.bucket().name; },
    file: (path: string) => adminStorage.bucket().file(path),
    getMetadata: () => adminStorage.bucket().getMetadata(),
};

// Also export a helper to get the raw bucket if needed
export const getAdminBucket = () => {
    if (!storage) storage = getAdminApp().storage();
    return storage.bucket(process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app");
};


