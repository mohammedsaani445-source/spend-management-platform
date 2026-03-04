import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID || 'spend-management-platform',
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
                databaseURL: "https://spend-management-platform-default-rtdb.firebaseio.com",
            });
        } else {
            // Fallback to application default credentials if available (e.g., local or GCP)
            admin.initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'spend-management-platform',
                databaseURL: "https://spend-management-platform-default-rtdb.firebaseio.com",
            });
        }
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.database() : null;
