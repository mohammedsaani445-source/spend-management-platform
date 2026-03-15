import { NextResponse } from "next/server";
import { adminBucket } from "@/lib/firebaseAdmin";
import * as admin from "firebase-admin";

/**
 * DIAGNOSTIC: Test Storage Bucket Connectivity.
 * Hit GET /api/storage-test to verify bucket access.
 */
export async function GET() {
    const results: Record<string, any> = {};

    // 1. Check what bucket name is configured
    results.configuredBucket = adminBucket.name;
    results.projectId = process.env.FIREBASE_PROJECT_ID;
    results.envBucket = process.env.FIREBASE_STORAGE_BUCKET || "(not set)";

    // 2. Try to check if bucket exists
    try {
        const [exists] = await adminBucket.exists();
        results.primaryBucketExists = exists;
    } catch (error: any) {
        results.primaryBucketError = error.message;
    }

    // 3. Try the appspot.com fallback
    try {
        const legacyBucket = admin.storage().bucket("spend-management-platform.appspot.com");
        const [exists] = await legacyBucket.exists();
        results.legacyBucketExists = exists;
        results.legacyBucketName = legacyBucket.name;
    } catch (error: any) {
        results.legacyBucketError = error.message;
    }

    // 4. Try the firebasestorage.app format
    try {
        const newBucket = admin.storage().bucket("spend-management-platform.firebasestorage.app");
        const [exists] = await newBucket.exists();
        results.newFormatBucketExists = exists;
        results.newFormatBucketName = newBucket.name;
    } catch (error: any) {
        results.newFormatBucketError = error.message;
    }

    return NextResponse.json(results, { status: 200 });
}
