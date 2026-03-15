import { NextRequest, NextResponse } from "next/server";
import { querySpendAnalyst } from "@/lib/ai_analyst";

/**
 * SERVER-SIDE AI PROXY
 * This route protects the GEMINI_API_KEY by keeping logic on the server.
 */
export async function POST(req: NextRequest) {
    try {
        const { tenantId, query } = await req.json();

        if (!tenantId || !query) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const answer = await querySpendAnalyst(tenantId, query);
        return NextResponse.json({ answer });
    } catch (error: any) {
        console.error("AI Proxy Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process AI request" },
            { status: 500 }
        );
    }
}
