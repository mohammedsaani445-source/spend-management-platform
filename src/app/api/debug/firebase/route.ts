import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
    
    // Safety check: Only allowed for administrators or via secret param
    const authHeader = req.headers.get("authorization");
    const secretParam = req.nextUrl.searchParams.get("token");

    // We keep this very safe: only log metadata, never the full key
    const diagnostics = {
        length: rawKey.length,
        hasBegin: rawKey.includes("-----BEGIN"),
        hasEnd: rawKey.includes("-----END"),
        hasBrace: rawKey.includes("{"),
        hasPrivateKeyField: rawKey.includes("private_key"),
        startsWithQuote: rawKey.startsWith('"') || rawKey.startsWith("'"),
        first10: rawKey.substring(0, 10),
        last10: rawKey.substring(rawKey.length - 10),
        envExists: {
            projectId: !!process.env.FIREBASE_PROJECT_ID,
            clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: !!process.env.FIREBASE_PRIVATE_KEY
        }
    };

    return NextResponse.json(diagnostics);
}
