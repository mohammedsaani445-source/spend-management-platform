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
    
    // 1. JSON Extraction
    if (key.startsWith('{')) {
        try {
            const parsed = JSON.parse(key);
            if (parsed.private_key) key = parsed.private_key;
        } catch (e) {}
    }

    // 2. Quote and Escaping Cleanup
    key = key.replace(/^["']|["']$/g, ''); // Strip outer quotes
    key = key.replace(/\\n/g, '\n').replace(/\r\n/g, '\n'); // Normalize newlines

    // 3. Header Detection
    const hasHeader = key.includes("-----BEGIN");
    
    // 4. Ultimate PEM Reconstruction
    try {
        // Find actual content markers
        const match = key.match(/-----BEGIN (.*)-----(.*)-----END \1-----/s);
        
        if (match) {
            const headerType = match[1]; // e.g., "PRIVATE KEY" or "RSA PRIVATE KEY"
            const body = match[2].replace(/[\s\r\n\t]/g, ''); // Purge ALL whitespace/non-printable
            
            // Rebuild with strict 64-char lines
            const lines = body.match(/.{1,64}/g) || [];
            key = `-----BEGIN ${headerType}-----\n${lines.join('\n')}\n-----END ${headerType}-----\n`;
        } else if (!hasHeader && key.length > 50) {
            // It's a raw base64 string
            const body = key.replace(/[\s\r\n\t]/g, '');
            const lines = body.match(/.{1,64}/g) || [];
            key = `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`;
        }
    } catch (e) {
        console.error("[FirebaseAdmin] Reconstruction failed, using fallback:", e);
    }

    const firebaseAdminConfig = {
        projectId,
        clientEmail,
        privateKey: key,
    };

    try {
        return admin.initializeApp({
            credential: admin.credential.cert(firebaseAdminConfig),
            databaseURL: "https://spend-management-platform-default-rtdb.firebaseio.com",
            storageBucket: BUCKET_NAME
        });
    } catch (error: any) {
        const msg = `Firebase Admin Init Failed: ${error.message}. FinalLength: ${key.length}. HasPEM: ${key.includes("-----BEGIN")}`;
        console.error(msg);
        throw new Error(msg);
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

