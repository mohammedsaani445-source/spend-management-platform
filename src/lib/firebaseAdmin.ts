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

let firestore: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;
let storage: admin.storage.Storage | null = null;
let rtdb: admin.database.Database | null = null;

function getDb() {
    if (!rtdb) rtdb = getAdminApp().database();
    return rtdb;
}

function getAuth() {
    if (!auth) auth = getAdminApp().auth();
    return auth;
}

function getStorage() {
    if (!storage) storage = getAdminApp().storage();
    return storage;
}

// RESTORED STABLE EXPORTS
// These are not proxies anymore, they are direct facade objects that resolve once
export const adminDb = {
    get ref() { return getDb().ref.bind(getDb()); }
} as any;

export const adminAuth = {
    get getUser() { return getAuth().getUser.bind(getAuth()); },
    get verifyIdToken() { return getAuth().verifyIdToken.bind(getAuth()); }
} as any;

export const adminStorage = {
    bucket: (name?: string) => getStorage().bucket(name || process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app")
} as any;

/**
 * adminBucket: A truly stable Reference
 * Pre-initialized to the default bucket.
 */
export const adminBucket = new Proxy({} as any, {
    get: (target, prop) => {
        const bucket = getStorage().bucket(process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app");
        return (bucket as any)[prop];
    }
});


