import { NextRequest, NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    console.log("[Diag] Storage diagnostic started...");
    
    const results: any = {
        timestamp: new Date().toISOString(),
        env: {
            hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
            hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
            hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
            privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
            hasBucket: !!process.env.FIREBASE_STORAGE_BUCKET,
        },
        tests: {}
    };

    try {
        console.log("[Diag] Attempting to access bucket...");
        const bucket = adminStorage.bucket();
        results.tests.bucketObjectCreated = !!bucket;
        results.tests.bucketName = bucket.name;



        console.log("[Diag] Running write test...");
        const testFile = bucket.file("diag_connection_test.txt");
        await testFile.save("Connection test at " + results.timestamp, {
            resumable: false,
            metadata: { contentType: "text/plain" }
        });
        
        results.tests.writeSuccess = true;
        console.log("[Diag] Write success.");

    } catch (error: any) {
        console.error("[Diag] Error during diagnostic:", error);
        results.error = {
            message: error.message,
            stack: error.stack?.split('\n').slice(0, 3),
            code: error.code
        };
    }

    return NextResponse.json(results);
}
