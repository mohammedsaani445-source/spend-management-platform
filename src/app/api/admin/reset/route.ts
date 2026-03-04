import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

/**
 * PRODUCTION REALIZATION: Reset Utility
 * This endpoint wipes the entire database to provide a fresh start.
 * In a real production system, this would be restricted to a Super Admin 
 * and requires a high-entropy secret token.
 */
export async function POST(req: NextRequest) {
    try {
        const { secret } = await req.json();

        // 1. Basic Security Check
        const RESET_SECRET = process.env.RESET_SECRET || 'antigravity-secure-wipe-2026';
        if (secret !== RESET_SECRET) {
            return NextResponse.json({ error: 'Unauthorized: Invalid Reset Secret' }, { status: 401 });
        }

        console.log("[Platform Reset] Initiating Total Database Wipe...");

        // 2. Wipe Primary Roots
        // We wipe the database at the root level to ensure all tenants and users are cleared.
        // This is the most destructive action possible.
        await set(ref(db, '/'), null);

        // 3. Re-initialize minimal required metadata (optional)
        // We can add logic here to re-seed basic config if necessary.
        await set(ref(db, 'meta/status'), {
            isFresh: true,
            resetAt: new Date().toISOString()
        });

        console.log("[Platform Reset] Total Wipe COMPLETED. Platform is now Fresh.");

        return NextResponse.json({
            success: true,
            message: 'Platform successfully wiped clean. Redirecting to fresh start...'
        });
    } catch (error: any) {
        console.error("[Platform Reset] RESET FAILED:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
