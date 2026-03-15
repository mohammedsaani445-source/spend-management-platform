import { NextRequest, NextResponse } from "next/server";
import { uploadToStorageServer } from "@/lib/ocr";

/**
 * PRODUCTION REALIZATION: Generic Server-Side Upload API.
 * This route allows any file to be securely uploaded from the server,
 * bypassing browser CORS limitations.
 */
export async function POST(req: NextRequest) {
    try {
        const { base64Data, fileName, mimeType } = await req.json();

        if (!base64Data) {
            return NextResponse.json({ error: "No document data provided" }, { status: 400 });
        }

        console.log(`[Upload-API] Initiating server-side upload for: ${fileName || "unnamed"}`);
        const fileUrl = await uploadToStorageServer(
            base64Data, 
            fileName || "upload", 
            mimeType || "application/octet-stream"
        );

        return NextResponse.json({ url: fileUrl });
    } catch (error: any) {
        console.error("[Upload-API] Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to upload file" },
            { status: 500 }
        );
    }
}
