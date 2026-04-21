import { NextRequest, NextResponse } from "next/server";
import { submitInvoiceToWorkflow, submitRequisitionToWorkflow } from "@/lib/workflow/integration";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { module, data, actor } = body;

        console.log(`[WorkflowAPI] Submitting ${module} for tenant ${data.tenantId || actor?.tenantId}`);

        if (module === 'INVOICE') {
            const result = await submitInvoiceToWorkflow(data.tenantId || actor.tenantId, data, actor);
            return NextResponse.json({ success: true, ...result });
        }

        if (module === 'REQUISITION') {
            const result = await submitRequisitionToWorkflow(data);
            return NextResponse.json({ success: true, ...result });
        }

        return NextResponse.json({ error: "Invalid module" }, { status: 400 });
    } catch (error: any) {
        console.error("[WorkflowAPI] Error:", error);
        return NextResponse.json({ error: error.message || "Failed to submit to workflow" }, { status: 500 });
    }
}
