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

/**
 * LAZY PROXY HELPER
 * Ensures services are initialized only when needed, 
 * handles "this" context binding, and maintains singleton identity.
 */
function createLazyProxy<T>(init: () => T): T {
    let instance: T | null = null;
    return new Proxy({} as any, {
        get(target, prop) {
            if (!instance) instance = init();
            const val = (instance as any)[prop];
            // Handle method binding (crucial for SDKs that use 'this')
            if (typeof val === 'function') {
                return val.bind(instance);
            }
            return val;
        },
        // Handle inherited properties and common checks
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
export const adminDb = createLazyProxy(() => getAdminApp().database());
export const adminAuth = createLazyProxy(() => getAdminApp().auth());
export const adminStorage = createLazyProxy(() => getAdminApp().storage());

/**
 * adminBucket: A truly stable Reference
 */
export const adminBucket = createLazyProxy(() => {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app";
    return getAdminApp().storage().bucket(bucketName);
});

// Helper for raw access if needed
export const getAdminBucket = () => adminBucket;


