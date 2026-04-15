process.env.GCS_HTTP2_DISABLE = 'true';
import * as admin from 'firebase-admin';

// FORCE DISABLE HTTP/2 for GCS (Fixes ERR_STREAM_DESTROYED on Vercel)

let adminApp: admin.app.App | null = null;

function getAdminApp() {
    if (adminApp) return adminApp;
    
    if (admin.apps.length > 0) {
        adminApp = admin.app();
        return adminApp;
    }
    
    const rawProjectId = process.env.FIREBASE_PROJECT_ID;
    const rawClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    const bucketName = (process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app").replace(/^["']|["']$/g, '').trim();

    if (!rawProjectId || !rawClientEmail || !rawPrivateKey) {
        throw new Error("Firebase configuration environment variables are missing.");
    }

    try {
        // HYPER-SANITIZATION: Strip quotes, trim whitespace, and normalize
        const sanitize = (val: string) => val.replace(/^["']|["']$/g, '').trim();
        
        const projectId = sanitize(rawProjectId);
        const clientEmail = sanitize(rawClientEmail);
        const databaseURL = (process.env.FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebasedatabase.app`).replace(/^["']|["']$/g, '').trim();
        let privateKey = rawPrivateKey
            .replace(/^["']|["']$/g, '') // Remove quotes
            .replace(/\\n/g, '\n')        // Fix escaped newlines
            .replace(/\r\n/g, '\n')       // Normalize newlines
            .trim();

        // Ensure headers are present
        if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
            privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
        }

        adminApp = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
            storageBucket: bucketName,
            databaseURL: databaseURL
        });
        
        console.log(`[FirebaseAdmin] Successfully initialized for project: ${projectId}`);
        return adminApp;
    } catch (error: any) {
        console.error("[FirebaseAdmin] Initialization CRASH:", error.message);
        throw error;
    }
}

/**
 * SAFE LAZY PROXY HELPER
 * Prevents initialization during the Build Phase when env vars are missing.
 * Only wakes up the SDK when a property is actually accessed at runtime.
 */
function createLazyProxy<T>(init: () => T): T {
    let instance: T | null = null;
    let error: any = null;

    return new Proxy({} as any, {
        get(target, prop) {
            // Internal health check to avoid triggering init
            if (prop === '__isProxy') return true;
            if (prop === '__error') return error;

            try {
                if (!instance) {
                    if (error) throw error;
                    instance = init();
                }
            } catch (e: any) {
                error = e;
                console.error(`[LazyProxy] Initialization failed for property "${String(prop)}":`, e.message);
                throw e;
            }
            
            const val = (instance as any)[prop];
            if (typeof val === 'function') {
                return val.bind(instance);
            }
            return val;
        },
        getOwnPropertyDescriptor(target, prop) {
            if (!instance) try { instance = init(); } catch (e) { return undefined; }
            return Object.getOwnPropertyDescriptor(instance, prop);
        },
        ownKeys() {
            if (!instance) try { instance = init(); } catch (e) { return []; }
            return Reflect.ownKeys(instance as any);
        }
    }) as T;
}

// EXPORTED SERVICES
export const adminAuth = createLazyProxy(() => getAdminApp().auth());
export const adminDb = createLazyProxy(() => getAdminApp().database());
export const adminStorage = createLazyProxy(() => getAdminApp().storage());

/**
 * Health check utility for API routes to safely check if Firebase is ready.
 */
export const checkFirebaseAdminHealth = () => {
    try {
        getAdminApp();
        return { healthy: true };
    } catch (error: any) {
        return { healthy: false, error: error.message };
    }
};

export const adminBucket = createLazyProxy(() => {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app";
    return getAdminApp().storage().bucket(bucketName);
});

export const getAdminBucket = () => adminBucket;


