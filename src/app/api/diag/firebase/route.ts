import { NextResponse } from 'next/server';
import { checkFirebaseAdminHealth } from '@/lib/firebaseAdmin';

export async function GET() {
    const health = await checkFirebaseAdminHealth();
    
    // Censored environment check
    const envStatus = {
        PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
        CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
        PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? {
            length: process.env.FIREBASE_PRIVATE_KEY.length,
            hasHeader: process.env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY'),
            firstFewChars: process.env.FIREBASE_PRIVATE_KEY.substring(0, 20) + "..."
        } : "MISSING",
        DATABASE_URL: process.env.FIREBASE_DATABASE_URL || "Using Fallback",
        NODE_ENV: process.env.NODE_ENV
    };

    return NextResponse.json({
        service: "Firebase Admin Diagnostic",
        timestamp: new Date().toISOString(),
        health,
        environment: envStatus
    }, { status: health.ok ? 200 : 503 });
}
