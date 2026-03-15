import { GoogleGenerativeAI } from "@google/generative-ai";
import { DB_PREFIX } from "./firebase";
import { adminDb } from "./firebaseAdmin";
import { SpendAnalytics } from "@/types";

/**
 * AI SPEND ANALYST (Ref: Procurify 2025 "Spend Analyst")
 * Conversational AI that interprets spend data.
 */
export const querySpendAnalyst = async (tenantId: string, query: string) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API Key missing");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // 1. Fetch Comprehensive Context Data
        const budgetsRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/budgets`);
        const invRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/invoices`);
        const vendorsRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/vendors`);
        const tendersRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/tenders`);

        const [budgetsSnap, invSnap, vendorsSnap, tendersSnap] = await Promise.all([
            budgetsRef.once('value'),
            invRef.once('value'),
            vendorsRef.once('value'),
            tendersRef.once('value')
        ]);

        const context = {
            budgets: budgetsSnap.exists() ? Object.values(budgetsSnap.val() as any) : [],
            invoices: invSnap.exists() ? Object.values(invSnap.val() as any) : [],
            vendors: vendorsSnap.exists() ? Object.values(vendorsSnap.val() as any) : [],
            tenders: tendersSnap.exists() ? Object.values(tendersSnap.val() as any) : [],
            currentDate: new Date().toISOString()
        };

        // 2. Intelligence Prompt (Conversational & Professional)
        const prompt = `
            You are "SANI", the helpful and intelligent AI assistant for the APEXPROCURE platform.
            Your goal is to provide a seamless, natural AI experience similar to the standard Gemini AI, but with deep knowledge of this company's procurement data.

            ### CORE BEHAVIOR:
            1. **Conversational First**: Respond naturally to greetings ("Hi", "Hello"), small talk, and general questions. Be friendly, professional, and helpful.
            2. **Data-Aware**: You have access to the company's real-time data provided below. Use it whenever the user asks about money, spend, vendors, budgets, or platform status.
            3. **Flexible Formatting**: 
               - For simple questions or chat, use clear, natural language.
               - ONLY use structured headers like # SITUATION or # ANALYSIS if the user specifically asks for an "executive report" or a "deep dive analysis" on spend data.
            4. **Platform Expert**: If asked about Apex Procure, explain that it is an enterprise spend management platform covering:
               - **Dashboard**: High-level spending insights.
               - **Procurement**: Requisitions, POs, and Vendor Management.
               - **Inventory**: Stock levels and warehouse tracking.
               - **Bidding**: Sourcing and tender events.
               - **Compliance**: Audit trails and policy enforcement.

            ### ENVIRONMENT CONTEXT (JSON):
            ${JSON.stringify(context, null, 2)}
            
            ### USER QUERY:
            "${query}"
            
            Always respond in Markdown. If the user asks for data in a table, provide it. Otherwise, be a great conversational AI.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Spend Analyst Library Error:", error);
        
        // Return a more descriptive error if it's an API key issue
        if (error.message?.includes("API key")) {
            throw new Error("AI_CONFIG_ERROR: The Gemini API key is invalid or blocked. " + error.message);
        }
        
        throw error;
    }
};
