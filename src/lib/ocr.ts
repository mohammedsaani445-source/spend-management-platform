import { GoogleGenerativeAI } from "@google/generative-ai";
import { getLearnedContext } from "./feedback";

/**
 * PRODUCTION REALIZATION: AI-Powered OCR Engine.
 * Instead of simple pattern matching, this uses Multi-modal AI (Gemini)
 * to intelligence extract fields from any invoice layout.
 */
export const extractInvoiceData = async (fileUrl: string, tenantId?: string, vendorId?: string) => {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API Key missing for OCR");

        // Fetch learned context if available
        let learnedContext = "";
        if (tenantId && vendorId) {
            learnedContext = await getLearnedContext(tenantId, vendorId);
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 1. Fetch the image and convert to base64
        console.log(`[AI-OCR] Processing invoice from: ${fileUrl}`);
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });

        // 2. Multi-modal Prompt
        const prompt = `
            Extract the following fields from this invoice image and return as JSON:
            - vendorName
            - invoiceNumber
            - totalAmount (number)
            - currency
            - issueDate (ISO string)
            - dueDate (ISO string)
            - items (array of {description, quantity, unitPrice, total})
            - confidenceReasoning (brief string explaining why fields were or were not extracted clearly)
            
            ${learnedContext}

            If you find any indicators of the document being a duplicate, "DRAFT", or having mismatched totals, mention it in the 'confidenceReasoning'.
            Return ONLY the raw JSON.
        `;

        console.log(`[AI-OCR] Sending request to Gemini (model: gemini-1.5-flash)...`);

        // Add a 30-second safety timeout
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("AI Analysis timed out after 30 seconds.")), 30000)
        );

        const aiCall = model.generateContent([
            prompt,
            { inlineData: { data: base64Data.split(',')[1], mimeType: blob.type } }
        ]);

        const result = await Promise.race([aiCall, timeout]) as any;

        console.log(`[AI-OCR] Received response from Gemini.`);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            // Calculate a score if not provided
            parsed.confidenceScore = parsed.confidenceScore || (parsed.vendorName && parsed.totalAmount ? 95 : 60);
            return parsed;
        }

        throw new Error("Failed to parse AI output");
    } catch (error) {
        console.error("AI OCR Error:", error);
        // Fallback or rethrow for UI to handle
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
        autoExtracted: true
    };
};

/**
 * Specialized OCR for small-format receipts (Food, Travel, Supplies).
 */
export const extractReceiptData = async (fileUrl: string, tenantId?: string) => {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API Key missing for OCR");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });

        const prompt = `
            Analyze this expense receipt image and extract:
            - vendorName (legal entity name)
            - totalAmount (as a number)
            - currency (ISO 3-letter code)
            - date (ISO string)
            - category (Suggest one of: Food, Travel, Office, Utilities, Marketing, Miscellaneous)
            - confidenceScore (0-100 for overall accuracy)
            - isDuplicate (Look for indicators of a duplicate receipt)

            Return as JSON ONLY.
        `;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data.split(',')[1], mimeType: blob.type } }
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error("AI failed to extract receipt data");
    } catch (error) {
        console.error("Receipt OCR Error:", error);
        throw error;
    }
};
