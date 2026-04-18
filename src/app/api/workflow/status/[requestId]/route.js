// ─────────────────────────────────────────────────────────────
// GET /api/workflow/status/[requestId] — Get approval status
// ─────────────────────────────────────────────────────────────
import { NextResponse }    from "next/server";
import { WorkflowEngine }  from "@/lib/workflow/engine";

export async function GET(request, { params }) {
  try {
    const status = await WorkflowEngine.getStatus(params.requestId);
    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    console.error("[API /workflow/status]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
