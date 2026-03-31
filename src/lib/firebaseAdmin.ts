import * as admin from 'firebase-admin';

/**
 * FIREBASE ADMIN SDK (SERVER-SIDE ONLY)
 * Used for high-privileged operations like AI data aggregation.
 */
function getAdminApp() {
    if (admin.apps.length > 0) return admin.app();
    
    const BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app";
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
    
    if (!projectId || !clientEmail || !rawKey) {
        console.error("Critical Firebase Admin environment variables are missing:", {
            projectId: !!projectId,
            clientEmail: !!clientEmail,
            privateKey: !!rawKey
        });
        // We throw a descriptive error that will be caught by our API routes
        throw new Error("Firebase Admin environment variables are not correctly configured. Please check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.");
    }
    
    let key = rawKey.trim();
    
    // STRIP ENCLOSING QUOTES (Common Vercel issue)
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
    if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
    
    // BASE64 FALLBACK: If the key doesn't look like PEM, check if it's Base64
    if (!key.includes("-----BEGIN PRIVATE KEY-----") && key.length > 100) {
        try {
            const decoded = Buffer.from(key, 'base64').toString('utf-8');
            if (decoded.includes("-----BEGIN PRIVATE KEY-----")) {
                key = decoded;
            }
        } catch (e) {
            console.error("[FirebaseAdmin] Failed Base64 decode attempt");
        }
    }
    
    // Handle both literal newlines and escaped newlines (\n)
    let formattedKey = key.replace(/\\n/g, '\n');

    // Final check for private key format
    if (!formattedKey.includes("-----BEGIN PRIVATE KEY-----")) {
        console.warn("[FirebaseAdmin] Warning: FIREBASE_PRIVATE_KEY may be malformed (missing PEM headers)");
    }


    const firebaseAdminConfig = {
        projectId,
        clientEmail,
        privateKey: formattedKey,
    };

    try {
        return admin.initializeApp({
            credential: admin.credential.cert(firebaseAdminConfig),
            databaseURL: "https://spend-management-platform-default-rtdb.firebaseio.com",
            storageBucket: BUCKET_NAME
        });
    } catch (error: any) {
        console.error("Failed to initialize Firebase Admin SDK:", error.message);
        throw error;
    }
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

