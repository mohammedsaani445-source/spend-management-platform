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
    return new Proxy({} as any, {
        get(target, prop) {
            // Lazy initialization on first access
            if (!instance) instance = init();
            
            const val = (instance as any)[prop];
            // Handle method binding to preserve 'this' context
            if (typeof val === 'function') {
                return val.bind(instance);
            }
            return val;
        },
        // Support common object operations for full SDK compatibility
        getOwnPropertyDescriptor(target, prop) {
            if (!instance) instance = init();
            return Object.getOwnPropertyDescriptor(instance, prop);
        },
        ownKeys() {
            if (!instance) instance = init();
            return Reflect.ownKeys(instance as any);
        }
    }) as T;
}

// EXPORTED SERVICES
// These behave exactly like the real Admin SDK objects but are initialized lazily.
export const adminAuth = createLazyProxy(() => getAdminApp().auth());
export const adminDb = createLazyProxy(() => getAdminApp().database());
export const adminStorage = createLazyProxy(() => getAdminApp().storage());

/**
 * adminBucket: A truly stable Reference
 * Lazily initialized to the project's primary storage bucket.
 */
export const adminBucket = createLazyProxy(() => {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app";
    return getAdminApp().storage().bucket(bucketName);
});

// Helper for raw access if needed
export const getAdminBucket = () => adminBucket;


