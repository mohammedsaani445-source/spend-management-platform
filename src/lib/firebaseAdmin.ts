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
    
    // 1. HANDLE JSON-WRAPPED KEYS (Common mistake: copying entire service-account.json)
    if (key.startsWith('{')) {
        try {
            const parsed = JSON.parse(key);
            if (parsed.private_key) {
                key = parsed.private_key;
                console.log("[FirebaseAdmin] Detected and extracted private_key from JSON input");
            }
        } catch (e) { /* Not valid JSON, continue */ }
    }

    // 2. STRIP ENCLOSING QUOTES
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
    if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
    
    // 3. BASE64 DECODE ATTEMPT (If the entire key is base64 encoded)
    if (!key.includes("-----BEGIN PRIVATE KEY-----") && key.length > 100) {
        try {
            const decoded = Buffer.from(key, 'base64').toString('utf-8');
            if (decoded.includes("-----BEGIN PRIVATE KEY-----")) {
                key = decoded;
            }
        } catch (e) { /* Not base64 */ }
    }

    // 4. NEWLINE NORMALIZATION
    // Replace double-escaped newlines and literal \n strings
    let formattedKey = key.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');

    // 5. PEM RECONSTRUCTION
    // If headers are missing, add them. 
    if (!formattedKey.includes("-----BEGIN PRIVATE KEY-----")) {
        // Remove any whitespace and wrap
        const cleanBase64 = formattedKey.replace(/\s/g, '');
        formattedKey = `-----BEGIN PRIVATE KEY-----\n${cleanBase64}\n-----END PRIVATE KEY-----`;
    }

    // 6. FINAL PEM VALIDATION & FORMATTING
    // Ensure the key has the correct PEM structure (header, 64-char lines, footer)
    try {
        const headerMask = "-----BEGIN PRIVATE KEY-----";
        const footerMask = "-----END PRIVATE KEY-----";
        
        // Extract content between headers if they exist multiple times or have fluff
        const startIdx = formattedKey.indexOf(headerMask);
        const endIdx = formattedKey.indexOf(footerMask);
        
        if (startIdx !== -1 && endIdx !== -1) {
            const rawBody = formattedKey.substring(startIdx + headerMask.length, endIdx).replace(/\s/g, '');
            const lines = rawBody.match(/.{1,64}/g) || [];
            formattedKey = `${headerMask}\n${lines.join('\n')}\n${footerMask}`;
        }
    } catch (e) {
        console.error("[FirebaseAdmin] Failed to reformat PEM body:", e);
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
        // Provide more context in the error message for the frontend to display
        const msg = `Firebase Admin Init Failed: ${error.message}. KeyLength: ${formattedKey.length}. StartsWithHeader: ${formattedKey.startsWith("-----BEGIN PRIVATE KEY-----")}`;
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

