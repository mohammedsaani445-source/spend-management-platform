import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DB_PREFIX } from "./firebase";
import { adminDb } from "./firebaseAdmin";
import { SpendAnalytics } from "@/types";

/**
 * AI SPEND ANALYST (Apex Procure 2025 "Spend Analyst")
 * Conversational AI that interprets spend data.
 */
export const querySpendAnalyst = async (tenantId: string, query: string, role?: string, department?: string) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API Key missing");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // 1. Fetch Comprehensive Context Data
        // Core Modules
        const budgetsRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/budgets`);
        const invRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/invoices`); // Invoices (AP)
        const vendorsRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/vendors`);
        const tendersRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/tenders`);
        const reqRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/requisitions`);
        const poRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/purchase_orders`);
        const billsRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/bills`);
        
        // Inventory & Asset Logic
        const skusRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/skus`);
        const stockRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/stock_levels`);
        
        // Temporal Context
        const auditRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/auditLogs`);

        const [
            budgetsSnap, invSnap, vendorsSnap, tendersSnap, 
            reqSnap, poSnap, billsSnap, skusSnap, 
            stockSnap, auditSnap
        ] = await Promise.all([
            budgetsRef.once('value'),
            invRef.once('value'),
            vendorsRef.once('value'),
            tendersRef.once('value'),
            reqRef.once('value'),
            poRef.once('value'),
            billsRef.once('value'),
            skusRef.once('value'),
            stockRef.once('value'),
            auditRef.limitToLast(20).once('value') // Last 20 actions for immediate context
        ]);

        let budgets = budgetsSnap.exists() ? Object.values(budgetsSnap.val() as any) : [];
        let invoices = invSnap.exists() ? Object.values(invSnap.val() as any) : [];
        let vendors = vendorsSnap.exists() ? Object.values(vendorsSnap.val() as any) : [];
        let tenders = tendersSnap.exists() ? Object.values(tendersSnap.val() as any) : [];
        let requisitions = reqSnap.exists() ? Object.values(reqSnap.val() as any) : [];
        let purchaseOrders = poSnap.exists() ? Object.values(poSnap.val() as any) : [];
        let bills = billsSnap.exists() ? Object.values(billsSnap.val() as any) : [];

        // Scoping Data if user is a Department Head
        if (role === 'dept_head' || role === 'AUTHORIZED_APPROVER') {
            if (department) {
                budgets = budgets.filter((b: any) => b.department === department);
                invoices = invoices.filter((i: any) => i.department === department);
                requisitions = requisitions.filter((r: any) => r.department === department);
                purchaseOrders = purchaseOrders.filter((p: any) => p.department === department);
                bills = bills.filter((b: any) => b.department === department);
            }
        }

        const context = {
            budgets,
            invoices,
            vendors,
            tenders,
            requisitions,
            purchaseOrders,
            bills,
            inventory: {
                skus: skusSnap.exists() ? Object.values(skusSnap.val() as any) : [],
                stockLevels: stockSnap.exists() ? Object.values(stockSnap.val() as any) : []
            },
            recentActivity: auditSnap.exists() ? Object.values(auditSnap.val() as any) : [],
            currentDate: new Date().toISOString()
        };

        // 2. Intelligence Prompt (Conversational & Professional)
        const prompt = `
            You are "SANI", the high-level intelligence engine for the APEX PROCURE platform.
            Your goal is to act as a Master procurement and operations analyst. You are not just a chatbot; you are an advisor with access to the entire company's operational heart.

            ### CORE BEHAVIOR:
            1. **Conversational First**: Respond naturally to greetings, small talk, and general questions. Be friendly, expert, and professional.
            2. **Platform Intelligence**: You have access to modules including Procurement, Payments (Bills/Invoices), Inventory, Bidding, and Budgets based on user scope.
            3. **Low Stock Alerts**:
               - If asked about "low stock", "alerts", or "inventory status", analyze the data.
               - Compare stock levels in \`inventory.stockLevels\` against the \`minStockLevel\` defined in \`inventory.skus\`.
               - Proactively report items that are below their minimum threshold.
            4. **Data-Driven Analysis**: Use the JSON context to answer specific questions about spend, vendors, or approvals.
            5. **Cross-Module Linkage**: Understand the lifecycle (Requisition -> PO -> Invoice -> Bill -> Payment).
            6. **Flexible Formatting**: 
               - Use Markdown. Use tables for data lists. Use bold for key figures.
               - Keep responses concise but thorough.

            ### ROLE-SPECIFIC GUIDELINES:
            ${role === 'auditor' ? 'You are assisting an Auditor. Ensure your tone is strictly factual and read-only. Do not suggest actions, edits, or operational maneuvers. Stick exclusively to reporting data exactly as it appears in the logs.' : ''}
            ${(role === 'dept_head' || role === 'AUTHORIZED_APPROVER') ? `You are assisting a Department Head for the ${department} department. Your data context has already been filtered to only include records for this department. Explicitly state that you are analyzing their department's data when appropriate. Do not attempt to summarize company-wide totals outside of their department context.` : ''}
            ${(role === 'warehouse' || role === 'OPERATIONS_RECEIVER' || role === 'asset_mgr') ? 'You are assisting a Warehouse/Receiving officer. Focus heavily on inventory, assets, receiving status, PO deliveries, and low stock alerts. Avoid deep financial budgeting analysis unless directly related to inventory value.' : ''}
            ${(role === 'proc_mgr' || role === 'PROCUREMENT_OFFICER' || role === 'STRATEGIC_SOURCER') ? 'You are assisting a Procurement Manager/Officer. Focus on vendor analysis, PO statuses, pending requisitions, and sourcing efficiencies.' : ''}

            ### ENVIRONMENT CONTEXT (JSON):
            ${JSON.stringify(context, null, 2)}
            
            ### USER QUERY:
            "${query}"
        `;
            
        // 3. Logic with Retry for resilience (handling 503 Service Unavailable)
        let attempts = 0;
        const maxAttempts = 3;
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        while (attempts < maxAttempts) {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error: any) {
                attempts++;
                const isRetryable = error.message?.includes("503") || error.message?.includes("500") || error.message?.includes("high demand");
                
                if (isRetryable && attempts < maxAttempts) {
                    console.warn("[SANI] Gemini busy (Attempt " + attempts + "/" + maxAttempts + "). Retrying in " + (attempts * 2) + "s...");
                    await delay(attempts * 2000);
                    continue;
                }
                throw error;
            }
        }
        throw new Error("SANI is currently overwhelmed. Please try again in 30 seconds.");
    } catch (error: any) {
        console.error("Spend Analyst Library Error:", error);
        
        // Return a more descriptive error if it's an API key issue
        if (error.message?.includes("API key")) {
            throw new Error("AI_CONFIG_ERROR: The Gemini API key is invalid or blocked. " + error.message);
        }
        
        throw error;
    }
};
