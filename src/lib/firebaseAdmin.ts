import * as admin from 'firebase-admin';

/**
 * FIREBASE ADMIN SDK (SERVER-SIDE ONLY)
 * Used for high-privileged operations like AI data aggregation.
 */
function getAdminApp() {
    if (admin.apps.length > 0) return admin.app();
    
    const BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app";
    const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
    const hasB64 = !!(serviceAccountB64 && serviceAccountB64.length > 100);
    
    let trace = `Init(B64:${hasB64})`;

    /**
     * PRIORITY 1: BASE64 SERVICE ACCOUNT JSON (The Bulletproof Method)
     */
    if (hasB64) {
        try {
            // Clean the B64 string from any accidental whitespace/newlines
            const cleanB64 = serviceAccountB64!.replace(/\s/g, '');
            const decoded = Buffer.from(cleanB64, 'base64').toString('utf8');
            const firebaseAdminConfig = JSON.parse(decoded);
            
            if (firebaseAdminConfig.private_key) {
                firebaseAdminConfig.private_key = firebaseAdminConfig.private_key.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
            }
            
            return admin.initializeApp({
                credential: admin.credential.cert(firebaseAdminConfig),
                databaseURL: "https://spend-management-platform-default-rtdb.firebaseio.com",
                storageBucket: BUCKET_NAME
            });
        } catch (error: any) {
            trace += ` > B64_Fail(${error.message.substring(0, 20)})`;
            // fall through to Priority 2
        }
    }

    /**
     * PRIORITY 2: INDIVIDUAL VARIABLES (The Fallback Method)
     */
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
    
    if (!projectId || !clientEmail || !rawKey) {
        throw new Error(`Firebase Admin Env Missing: PJ:${!!projectId} EM:${!!clientEmail} KY:${!!rawKey}. Trace: ${trace}`);
    }
    
    let key = rawKey.trim();

    // 0. Handle URL/Shell Mangle: '+' becomes ' ' or '%20'
    if (key.includes('%')) {
        try { key = decodeURIComponent(key); trace += " > URL_Decoded"; } catch (e) { /* ignore */ }
    }
    
    // 1. Recursive JSON/Field Extraction
    try {
        let depth = 0;
        let found = false;
        while (depth < 3 && !found) {
            key = key.trim().replace(/^["']|["']$/g, ''); 
            const fieldRegex = /["\\]*private_?key["\\]*\s*[:=]\s*["\\]*(-----BEGIN[\s\S]*?-----END[\s\S]*?|MII[\s\S]*?)(?=["\\]*[,}\n]|$)/i;
            const match = key.match(fieldRegex);
            if (match && match[1]) {
                key = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
                found = true;
                trace += " > Regex_Extract";
            } else { break; }
            depth++;
        }
    } catch (e) { trace += " > Extract_Err"; }

    // 2. Standard Cleanup & Double-Escape Fix
    key = key.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n').replace(/\r\n/g, '\n');
    trace += ` > Std_Clean(${key.length})`;

    // 3. Ultimate PEM Reconstruction (ASN.1 Guard)
    const isJsonLike = key.includes('{') || key.includes('project_id');
    
    if (!isJsonLike) {
        try {
            let headerType = "PRIVATE KEY";
            let body = "";

            const pemMatch = key.match(/-----BEGIN (.*)-----([\s\S]*?)-----END \1-----/);
            if (pemMatch) {
                headerType = pemMatch[1];
                body = pemMatch[2];
            } else {
                body = key;
                trace += " > Raw_Body";
            }

            // The BIG fix: handle spaces that should be pluses AND strip garbage
            // ASN.1 errors often happen because '+' was converted to ' '
            body = body.replace(/ /g, '+').replace(/[^A-Za-z0-9+/=]/g, '');

            if (body.length > 500) {
                const lines = body.match(/.{1,64}/g) || [];
                key = `-----BEGIN ${headerType}-----\n${lines.join('\n')}\n-----END ${headerType}-----\n`;
                trace += " > PEM_Reconstruct";
            }
        } catch (e) {
            trace += " > PEM_Err";
        }
    } else {
        trace += " > Skip_PEM_JSON";
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
        const msg = `Firebase Admin Final Fail: ${error.message}. Trace: ${trace}. FinalLen: ${key.length}. HasPEM: ${key.includes("-----BEGIN")}`;
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

