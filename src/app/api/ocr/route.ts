import { NextRequest, NextResponse } from "next/server";
import { extractInvoiceDataServer, uploadToStorageServer } from "@/lib/ocr";

/**
 * PRODUCTION REALIZATION: AI-Powered OCR & Storage API.
 * This route handles BOTH the cloud storage upload AND AI extraction
 * in a single secure server-side transaction.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null);
        
        if (!body || !body.base64Data) {
            return NextResponse.json({ error: "No document data provided" }, { status: 400 });
        }

        const { base64Data, fileName, mimeType } = body;

        // 1. Secure Server-Side Upload (Bypasses CORS)
        let fileUrl: string;
        try {
            console.log(`[OCR-API] Step 1: Uploading ${fileName || "unnamed"} (${(base64Data.length / 1024).toFixed(1)}KB base64)...`);
            fileUrl = await uploadToStorageServer(
                base64Data, 
                fileName || "invoice.pdf", 
                mimeType || "application/pdf"
            );
            console.log(`[OCR-API] Step 1 Complete: ${fileUrl}`);
        } catch (uploadError: any) {
            console.error("[OCR-API] UPLOAD FAILED:", uploadError.message, uploadError.stack);
            return NextResponse.json(
                { error: `Storage upload failed: ${uploadError.message}` },
                { status: 500 }
            );
        }

        // 2. Intelligent AI Extraction
        let aiData: any;
        try {
            console.log(`[OCR-API] Step 2: AI extraction starting...`);
            aiData = await extractInvoiceDataServer(base64Data, mimeType || "application/pdf");
            console.log(`[OCR-API] Step 2 Complete: Extracted ${Object.keys(aiData).length} fields`);
        } catch (aiError: any) {
            console.error("[OCR-API] AI EXTRACTION FAILED:", aiError.message, aiError.stack);
            // Still return the URL even if AI fails - the file was uploaded successfully
            return NextResponse.json(
                { error: `AI extraction failed: ${aiError.message}`, url: fileUrl },
                { status: 500 }
            );
        }
        
        // Return both the persistent URL and the extracted data
        return NextResponse.json({
            url: fileUrl,
            ...aiData
        });
    } catch (error: any) {
        console.error("[OCR-API] UNEXPECTED ERROR:", error.message, error.stack);
        return NextResponse.json(
            { error: error.message || "An unexpected server error occurred" },
            { status: 500 }
        );
    }
}
