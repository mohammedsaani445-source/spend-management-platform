import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * PRODUCTION REALIZATION: AI-Powered OCR Engine.
 * Instead of simple pattern matching, this uses Multi-modal AI (Gemini)
 * to intelligence extract fields from any invoice layout.
 */
export const extractInvoiceData = async (fileUrl: string) => {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API Key missing for OCR");

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
            
            Return ONLY the raw JSON.
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
