import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminBucket } from "./firebaseAdmin";

/**
 * PRODUCTION REALIZATION: Server-Side Storage Upload with Multi-Bucket Fallback.
 * Bypasses client-side CORS and handles inconsistent bucket naming conventions
 * between Firebase Admin and Client SDKs.
 */
export const uploadToStorageServer = async (base64Data: string, fileName: string, mimeType: string): Promise<string> => {
    const timestamp = Date.now();
    const filePath = `invoices/${timestamp}_${fileName}`;
    const buffer = Buffer.from(base64Data, 'base64');

    const tryUpload = async (targetBucket: any) => {
        const file = targetBucket.file(filePath);
        await file.save(buffer, {
            metadata: { contentType: mimeType },
            public: true,
            resumable: false
        });
        const encodedPath = encodeURIComponent(filePath);
        return `https://firebasestorage.googleapis.com/v0/b/${targetBucket.name}/o/${encodedPath}?alt=media`;
    };

    try {
        console.log(`[Storage-Server] Attempting upload to primary bucket: ${adminBucket.name}`);
        return await tryUpload(adminBucket);
    } catch (error: any) {
        if (error.message.includes("does not exist")) {
            console.warn(`[Storage-Server] Primary bucket not found. Retrying with legacy appspot.com backup...`);
            try {
                const legacyBucket = adminBucket.storage.bucket("spend-management-platform.appspot.com");
                return await tryUpload(legacyBucket);
            } catch (fallbackError: any) {
                console.error("[Storage-Server] Fallback also failed:", fallbackError.message);
                throw new Error("Specified bucket does not exist on this project. Please check Firebase Console.");
            }
        }
        console.error("[Storage-Server] Upload Error:", error.message);
        throw new Error("Failed to upload file to storage: " + error.message);
    }
};

/**
 * PRODUCTION REALIZATION: AI-Powered OCR Engine.
 * This is now SERVER-SIDE compatible. 
 * Instead of simple pattern matching, this uses Multi-modal AI (Gemini)
 * to intelligently extract fields from any invoice layout.
 */
export const extractInvoiceDataServer = async (base64Data: string, mimeType: string) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API Key missing for OCR");

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using the latest available functional model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Multi-modal Prompt
        const prompt = `
            Act as a Lead Accounts Payable Specialist. 
            Extract exactly these fields from this invoice image and return as a clean JSON object:
            - vendorName: The legal name of the biller
            - invoiceNumber: The unique ID of this bill
            - totalAmount: Numerical value only
            - currency: ISO 3-letter code (e.g. USD, EUR, GBP)
            - issueDate: Date of invoice (ISO 8601)
            - dueDate: When payment is due (ISO 8601)
            - items: Array of objects with {description: string, quantity: number, unitPrice: number, total: number}
            - taxAmount: Total tax found (numerical)
            - confidenceScore: Your confidence rank (0-100)
            - confidenceReasoning: Brief note on data clarity
            
            Return ONLY the raw JSON block. Avoid Markdown backticks.
        `;

        console.log(`[AI-OCR-SERVER] Processing data with Gemini 2.5...`);

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType: mimeType } }
        ]);

        console.log(`[AI-OCR-SERVER] Received response.`);
        
        const responseText = result.response.text();
        // Clean up the response in case Gemini adds markdown
        const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        try {
            const parsed = JSON.parse(cleanedJson);
            return parsed;
        } catch (e) {
            // Strategic fallback: search for JSON-like block
            const match = responseText.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
            throw new Error("AI output was not valid JSON: " + responseText);
        }

    } catch (error: any) {
        console.error("[AI-OCR-SERVER] Error:", error.message);
        throw error;
    }
};

/**
 * Auto-populates a draft invoice from AI results.
 */
export const autoPopulateInvoice = (aiData: any) => {
    return {
        vendorName: aiData.vendorName || "Unknown Vendor",
        invoiceNumber: aiData.invoiceNumber || "",
        amount: aiData.totalAmount || 0,
        currency: aiData.currency || "USD",
        issueDate: aiData.issueDate ? new Date(aiData.issueDate) : new Date(),
        dueDate: aiData.dueDate ? new Date(aiData.dueDate) : new Date(),
        items: aiData.items || [],
        status: 'DRAFT',
        autoExtracted: true,
        confidence: aiData.confidenceScore || 0,
        taxAmount: aiData.taxAmount || 0
    };
};
