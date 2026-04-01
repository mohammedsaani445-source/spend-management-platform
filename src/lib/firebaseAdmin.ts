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
    
    // 1. Recursive JSON/Quote Extraction
    // Handles double-escaped strings or JSON files nested inside strings
    let depth = 0;
    while (depth < 3 && (key.includes('{') || key.startsWith('"') || key.startsWith("'"))) {
        key = key.trim().replace(/^["']|["']$/g, ''); // Strip outer quotes
        if (key.includes('{') && key.includes('private_key')) {
            try {
                const start = key.indexOf('{');
                const end = key.lastIndexOf('}');
                const jsonPart = key.substring(start, end + 1);
                const parsed = JSON.parse(jsonPart);
                if (parsed.private_key) key = parsed.private_key;
            } catch (e) { break; }
        } else {
            break;
        }
        depth++;
    }

    // 2. Standard Escaping Cleanup
    key = key.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');

    // 3. Ultimate PEM Reconstruction
    try {
        let headerType = "PRIVATE KEY";
        let body = "";

        // Strategy A: Find the FIRST valid PEM block and isolate it
        const match = key.match(/-----BEGIN (.*)-----([\s\S]*?)-----END \1-----/);
        
        if (match) {
            headerType = match[1];
            body = match[2].replace(/[^A-Za-z0-9+/=]/g, '');
        } else {
            // Strategy B: Treat the whole thing as a raw Base64 blob if no headers found
            body = key.replace(/[^A-Za-z0-9+/=]/g, '');
        }

        if (body.length > 100) {
            const lines = body.match(/.{1,64}/g) || [];
            key = `-----BEGIN ${headerType}-----\n${lines.join('\n')}\n-----END ${headerType}-----\n`;
        }
    } catch (e) {
        console.error("[FirebaseAdmin] Reconstruction failed:", e);
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

