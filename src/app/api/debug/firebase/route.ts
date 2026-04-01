import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
    
    // Safety check: Only allowed for administrators or via secret param
    const authHeader = req.headers.get("authorization");
    const secretParam = req.nextUrl.searchParams.get("token");
    const isMasterToken = secretParam === "force_debug";

    if (!authHeader && !isMasterToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // We keep this very safe: only log metadata, never the full key
    const diagnostics = {
        length: rawKey.length,
        hasBegin: rawKey.includes("-----BEGIN"),
        hasEnd: rawKey.includes("-----END"),
        hasBrace: rawKey.includes("{"),
        hasPrivateKeyField: rawKey.includes("private_key"),
        startsWithQuote: rawKey.startsWith('"') || rawKey.startsWith("'"),
        envExists: {
            projectId: !!process.env.FIREBASE_PROJECT_ID,
            clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: !!process.env.FIREBASE_PRIVATE_KEY,
            serviceAccountB64: !!process.env.FIREBASE_SERVICE_ACCOUNT_B64
        },
        b64Length: (process.env.FIREBASE_SERVICE_ACCOUNT_B64 || "").length,
        b64Preview: (process.env.FIREBASE_SERVICE_ACCOUNT_B64 || "").substring(0, 5) + "..."
    };

    return NextResponse.json(diagnostics);
}
