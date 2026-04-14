import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminBucket, adminStorage } from "./firebaseAdmin";
import crypto from "crypto";

/**
 * PRODUCTION REALIZATION: Server-Side Storage Upload with Multi-Bucket Fallback.
 */
export const uploadToStorageServer = async (
    base64Data: string, 
    fileName: string, 
    mimeType: string,
    folder: string = "invoices/"
): Promise<string> => {
    const timestamp = Date.now();
    const filePath = `${folder}${timestamp}_${fileName}`;
    const buffer = Buffer.from(base64Data, 'base64');

    const tryUpload = async (targetBucket: any) => {
        const file = targetBucket.file(filePath);
        await file.save(buffer, {
            metadata: { 
                contentType: mimeType,
                metadata: {
                    firebaseStorageDownloadTokens: crypto.randomUUID()
                }
            },
            resumable: false
        });
        const encodedPath = encodeURIComponent(filePath);
        return `https://firebasestorage.googleapis.com/v0/b/${targetBucket.name}/o/${encodedPath}?alt=media`;
    };

    try {
        console.log(`[Storage-Server] Attempting upload to: ${adminBucket.name}/${filePath}`);
        return await tryUpload(adminBucket);
    } catch (error: any) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes("does not exist") || errorMsg.includes("not found")) {
            console.warn(`[Storage-Server] Primary bucket not found. Retrying fallback...`);
            try {
                const legacyBucket = adminStorage.bucket("spend-management-platform.appspot.com");
                return await tryUpload(legacyBucket);
            } catch (fallbackError: any) {
                console.error("[Storage-Server] Fallback failed:", fallbackError.message);
                throw new Error(`Bucket configuration error. Primary: ${adminBucket.name}, Fallback: appspot. Details: ${fallbackError.message}`);
            }
        }


        if (errorMsg.includes("permissiondenied") || errorMsg.includes("forbidden")) {
            throw new Error(`Permission Denied: Ensure service account has Storage Object Admin role. Original: ${error.message}`);
        }

        throw new Error(`Upload Failed: ${error.message} (Path: ${filePath})`);
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
        
        // Priority list of models to try in case of 503 (High Demand) or 404 (Availability)
        const modelNames = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-2.5-flash"];
        let lastError: any;

        for (const modelName of modelNames) {
            try {
                console.log(`[AI-OCR-SERVER] Attempting extraction with ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });

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

                const result = await model.generateContent([
                    prompt,
                    { inlineData: { data: base64Data, mimeType: mimeType } }
                ]);

                const responseText = result.response.text();
                console.log(`[AI-OCR-SERVER] Success with ${modelName}. Response length: ${responseText.length}`);
                
                const extractJson = (text: string) => {
                    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
                    const match = text.match(codeBlockRegex);
                    if (match && match[1]) return match[1].trim();
                    const firstBrace = text.indexOf('{');
                    const lastBrace = text.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                        return text.substring(firstBrace, lastBrace + 1).trim();
                    }
                    return text.trim();
                };

                const cleanedJson = extractJson(responseText);
                try {
                    return JSON.parse(cleanedJson);
                } catch (e: any) {
                    console.error(`[AI-OCR-SERVER] JSON Parse Error with ${modelName}.`);
                    lastError = e;
                    continue; // Try next model if JSON is garbage
                }
            } catch (e: any) {
                console.warn(`[AI-OCR-SERVER] ${modelName} failed/busy: ${e.message}`);
                lastError = e;
                // Move to next model in the list
            }
        }

        // if we get here, all models failed
        throw new Error(`AI extraction failed across all models. Last error: ${lastError?.message}`);

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
