import { GoogleGenerativeAI } from "@google/generative-ai";
import { db, DB_PREFIX } from "./firebase";
import { ref, get } from "firebase/database";
import { SpendAnalytics } from "@/types";

/**
 * AI SPEND ANALYST (Ref: Procurify 2025 "Spend Analyst")
 * Conversational AI that interprets spend data.
 */
export const querySpendAnalyst = async (tenantId: string, query: string) => {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API Key missing");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 1. Fetch Context Data
        // In a pro system, we'd use embedding search to find relevant context.
        // For this realization, we fetch the high-level analytics summary.
        const budgetsRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/budgets`);
        const invRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/invoices`);

        const [budgetsSnap, invSnap] = await Promise.all([
            get(budgetsRef),
            get(invRef)
        ]);

        const context = {
            budgets: budgetsSnap.exists() ? Object.values(budgetsSnap.val()) : [],
            invoices: invSnap.exists() ? Object.values(invSnap.val()) : [],
            currentDate: new Date().toISOString()
        };

        // 2. Intelligence Prompt
        const prompt = `
            You are "SANI", an elite Enterprise AI Spend Analyst for the APEXPROCURE Procurement Platform.
            
            Current Tenant Context (JSON):
            ${JSON.stringify(context, null, 2)}
            
            User Query: "${query}"
            
            Instructions for your response:
            1. **Persona**: You are a sharp, data-driven, strategic financial consultant (think McKinsey or Big 4 consulting). Be professional, authoritative, and concise.
            2. **Analysis**: Analyze the provided budget and invoice data to formulate an accurate answer.
            3. **Insights**: Don't just regurgitate numbers. Provide actionable insights, highlight anomalies, or suggest optimizations where relevant.
            4. **Formatting**: Use Markdown extensively. Use bolding for key metrics. Use short bullet points for readability. DO NOT use generic greetings like "Hello" or "Here is the data". Get straight to the analysis.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Spend Analyst Error:", error);
        return "I'm sorry, I encountered an error analyzing your data. Please try again or contact support.";
    }
};
