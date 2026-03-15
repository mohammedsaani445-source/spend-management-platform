import * as admin from 'firebase-admin';

/**
 * FIREBASE ADMIN SDK (SERVER-SIDE ONLY)
 * Used for high-privileged operations like AI data aggregation.
 */
function getAdminApp() {
    if (admin.apps.length > 0) return admin.app();
    
    const BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app";
    const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
    // Robust cleaning: handle both literal and escaped newlines, and strip surrounding quotes
    const formattedKey = rawKey
        .replace(/\\n/g, '\n')
        .replace(/\n\s+/g, '\n') // Remove indentation spaces after newlines
        .replace(/^"(.*)"$/, '$1')
        .replace(/^'(.*)'$/, '$1')
        .trim();

    const firebaseAdminConfig = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedKey,
    };

    return admin.initializeApp({
        credential: admin.credential.cert(firebaseAdminConfig),
        databaseURL: "https://spend-management-platform-default-rtdb.firebaseio.com",
        storageBucket: BUCKET_NAME
    });
}

// Proxies for broad compatibility without changing import sites
export const adminDb = new Proxy({} as admin.database.Database, {
    get: (target, prop) => (getAdminApp().database() as any)[prop]
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
    get: (target, prop) => (getAdminApp().auth() as any)[prop]
});

export const adminStorage = new Proxy({} as admin.storage.Storage, {
    get: (target, prop) => (getAdminApp().storage() as any)[prop]
});

export const adminBucket = new Proxy({} as any, {
    get: (target, prop) => {
        const BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app";
        return (getAdminApp().storage().bucket(BUCKET_NAME) as any)[prop];
    }
});

