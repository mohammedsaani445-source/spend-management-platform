import "server-only";
process.env.GCS_HTTP2_DISABLE = 'true';
import * as admin from 'firebase-admin';

// FORCE DISABLE HTTP/2 for GCS (Fixes ERR_STREAM_DESTROYED on Vercel)

const ADMIN_APP_NAME = 'apex-procure-admin';

function getAdminApp() {
    // 1. Check if our named app already exists
    const existingApp = admin.apps.find(app => app?.name === ADMIN_APP_NAME);
    if (existingApp) return existingApp;

    const rawProjectId = process.env.FIREBASE_PROJECT_ID;
    const rawClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // THE URL WE VERIFIED AS WORKING
    const databaseURL = "https://spend-management-platform-default-rtdb.firebaseio.com";
    const bucketName = "spend-management-platform.firebasestorage.app";

    if (!rawProjectId || !rawClientEmail || !rawPrivateKey) {
        throw new Error("Firebase configuration environment variables are missing (PID/Email/Key).");
    }

    try {
        const sanitize = (val: string) => val.replace(/^["']|["']$/g, '').trim();
        const projectId = sanitize(rawProjectId);
        const clientEmail = sanitize(rawClientEmail);
        
        let privateKey = rawPrivateKey
            .replace(/^["']|["']$/g, '') 
            .replace(/\\n/g, '\n')        
            .replace(/\r\n/g, '\n')       
            .trim();

        if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
            privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
        }

        console.log(`[FirebaseAdmin] Initializing "${ADMIN_APP_NAME}" with URL: ${databaseURL}`);

        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
            storageBucket: bucketName,
            databaseURL: databaseURL
        }, ADMIN_APP_NAME);
        
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
export const checkFirebaseAdminHealth = async () => {
    try {
        console.log("[FirebaseAdmin] Running health check...");
        const app = getAdminApp();
        
        // Use a timeout for the connection check so we don't hang the API
        const connectionCheck = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Firebase Database connection timeout (10s)")), 10000);
            app.database().ref(".info/connected").once("value")
                .then(snap => {
                    clearTimeout(timeout);
                    console.log("[FirebaseAdmin] Connection check result:", snap.val());
                    resolve(snap.val());
                })
                .catch(err => {
                    clearTimeout(timeout);
                    reject(err);
                });
        });

        await connectionCheck;
        return { ok: true };
    } catch (e: any) {
        console.error("[FirebaseAdmin] Health check error:", e.message);
        return { 
            ok: false, 
            error: e.message,
            stack: e.stack
        };
    }
};

export const adminBucket = createLazyProxy(() => {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || "spend-management-platform.firebasestorage.app";
    return getAdminApp().storage().bucket(bucketName);
});

export const getAdminBucket = () => adminBucket;


