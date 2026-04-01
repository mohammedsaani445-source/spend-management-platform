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
    let trace = "Init";

    // 0. Preliminary Handle (Handles URL Encoding)
    if (key.includes('%')) {
        try {
            key = decodeURIComponent(key);
            trace += " > URL_Decoded";
        } catch (e) { /* ignore */ }
    }
    
    // 1. Recursive Field Extraction (Regex-based)
    // Much more robust than JSON.parse for mangled strings
    try {
        let depth = 0;
        let found = false;
        while (depth < 5 && !found) {
            key = key.trim().replace(/^["']|["']$/g, ''); // Strip outer quotes
            
            // Look for private_key or privateKey field with various quoting/escaping
            // Patterns: "private_key": "...", \"private_key\": \"...\", etc.
            // This captures everything between the value quotes and stops at the closing quote or comma
            const fieldRegex = /["\\]*private_?key["\\]*\s*[:=]\s*["\\]*(-----BEGIN[\s\S]*?-----END[\s\S]*?|MII[\s\S]*?)(?=["\\]*[,}\n]|$)/i;
            const match = key.match(fieldRegex);
            
            if (match && match[1]) {
                key = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
                found = true;
                trace += " > Regex_Extracted";
            } else {
                break; // No JSON field found, move to next cleaners
            }
            depth++;
        }
    } catch (e) {
        trace += " > Extraction_Fail";
    }

    // 2. Standard Escaping Cleanup
    key = key.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
    trace += ` > Standard_Clean(${key.length})`;

    // 3. Ultimate PEM Reconstruction
    // ONLY do this if it doesn't look like JSON boilerplate (brackets/quotes with project_id)
    const isJsonLike = key.includes('{') || key.includes('project_id');
    
    if (!isJsonLike) {
        try {
            let headerType = "PRIVATE KEY";
            let body = "";

            // Find the FIRST valid PEM block or treat as raw Base64
            const pemMatch = key.match(/-----BEGIN (.*)-----([\s\S]*?)-----END \1-----/);
            if (pemMatch) {
                headerType = pemMatch[1];
                body = pemMatch[2].replace(/[^A-Za-z0-9+/=]/g, '');
                trace += " > PEM_Regex_Match";
            } else {
                body = key.replace(/[^A-Za-z0-9+/=]/g, '');
                trace += " > Raw_Base64_Clean";
            }

            if (body.length > 100) {
                const lines = body.match(/.{1,64}/g) || [];
                key = `-----BEGIN ${headerType}-----\n${lines.join('\n')}\n-----END ${headerType}-----\n`;
                trace += " > PEM_Reconstructed";
            }
        } catch (e) {
            trace += " > PEM_Fail";
        }
    } else {
        trace += " > Skip_PEM_JSON_detected";
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
        const msg = `Firebase Admin Init Failed: ${error.message}. Trace: ${trace}. FinalLength: ${key.length}. HasPEM: ${key.includes("-----BEGIN")}`;
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

