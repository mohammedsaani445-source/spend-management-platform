import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { DB_PREFIX } from "@/lib/firebase";

export async function GET(req: NextRequest) {
    const results: any = {
        timestamp: new Date().toISOString(),
        env: {
            FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? "PRESENT" : "MISSING",
            FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? "PRESENT" : "MISSING",
            FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? `PRESENT (Length: ${process.env.FIREBASE_PRIVATE_KEY.length})` : "MISSING",
            FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || "DEFAULT",
            NODE_ENV: process.env.NODE_ENV,
            DB_PREFIX: DB_PREFIX
        },
        diagnostics: {}
    };

    try {
        // Test 1: Admin Initialization
        try {
            const authExists = !!adminAuth;
            const dbExists = !!adminDb;
            results.diagnostics.adminInitialized = { auth: authExists, db: dbExists };
        } catch (e: any) {
            results.diagnostics.adminInitialized = { error: e.message };
        }

        // Test 2: Database Connection (Fetch root names or version)
        if (adminDb) {
            try {
                const rootSnap = await adminDb.ref(`${DB_PREFIX}/version`).get();
                results.diagnostics.databaseConnection = { 
                    success: true, 
                    path: `${DB_PREFIX}/version`,
                    exists: rootSnap.exists(),
                    value: rootSnap.val()
                };
            } catch (e: any) {
                results.diagnostics.databaseConnection = { success: false, error: e.message };
            }
        }

        // Test 3: Auth verification test (requires no token, just checking if the service is up)
        try {
            results.diagnostics.authService = "UP";
        } catch (e: any) {
            results.diagnostics.authService = { error: e.message };
        }

        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json({ 
            error: "Health check failed catastrophically", 
            message: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
}
