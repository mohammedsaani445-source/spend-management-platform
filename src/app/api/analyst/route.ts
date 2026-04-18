import { NextRequest, NextResponse } from "next/server";
import { querySpendAnalyst } from "@/lib/ai_analyst";
import { checkFirebaseAdminHealth } from "@/lib/firebaseAdmin";
import { aiGateway } from "@/lib/workflow/aiGateway";

/**
 * SERVER-SIDE AI PROXY
 * This route protects the GEMINI_API_KEY by keeping logic on the server.
 * Action-type queries are intercepted by the AI Gateway and routed
 * through the Workflow Engine for approval before execution.
 */
export async function POST(req: NextRequest) {
    // 1. Pre-flight health check
    const health = await checkFirebaseAdminHealth();
    if (!health.ok) {
        return NextResponse.json({ 
            error: "Cloud database connection failed. Please check your FIREBASE environment variables.",
            details: health.error,
            stack: health.stack
        }, { status: 503 });
    }

    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
            { error: "AI_CONFIG_ERROR", message: "Gemini API key is missing on the server." },
            { status: 500 }
        );
    }

    try {
        const body = await req.json();
        const { tenantId, query, role, department, userId, userName } = body;

        if (!tenantId || !query) {
            return NextResponse.json({ error: "Missing required fields (tenantId or query)" }, { status: 400 });
        }

        // Check if the query is an AI-driven action (create PO, approve req, etc.)
        const actionResult = await aiGateway.intercept({
            tenantId,
            query,
            userId: userId || "ai-system",
            userName: userName || "SANI AI",
            role: role || "analyst",
            department,
        });

        if (actionResult && actionResult.intercepted) {
            return NextResponse.json({
                answer: actionResult.response,
                workflowRequestId: actionResult.requestId,
                status: actionResult.status,
            });
        }

        // Standard analytical query — no action needed
        const answer = await querySpendAnalyst(tenantId, query, role, department);
        return NextResponse.json({ answer });
    } catch (error: any) {
        console.error("[SANI ERROR] AI Proxy Fatal Error:", error);
        
        // Ensure we ALWAYS return JSON
        return NextResponse.json(
            { 
                error: "REQUEST_FAILED", 
                message: error.message || "Failed to process AI request",
                type: error.constructor.name || "Error",
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
