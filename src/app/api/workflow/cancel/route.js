// ─────────────────────────────────────────────────────────────
// POST /api/workflow/cancel — Cancel a pending approval request
// ─────────────────────────────────────────────────────────────
import { NextResponse }    from "next/server";
import { WorkflowEngine }  from "@/lib/workflow/engine";

export async function POST(request) {
  try {
    const { requestId, reason, userId } = await request.json();

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 401 });
    if (!requestId) return NextResponse.json({ error: "requestId is required" }, { status: 400 });

    const result = await WorkflowEngine.cancel(requestId, userId, reason);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API /workflow/cancel]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
