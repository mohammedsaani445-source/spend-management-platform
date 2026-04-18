// ─────────────────────────────────────────────────────────────
// GET /api/workflow/pending — Get pending approvals for a user
// ─────────────────────────────────────────────────────────────
import { NextResponse }    from "next/server";
import { WorkflowEngine }  from "@/lib/workflow/engine";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const orgId  = searchParams.get("orgId");

    if (!userId || !orgId) {
      return NextResponse.json({ error: "userId and orgId query params are required" }, { status: 400 });
    }

    const pending = await WorkflowEngine.getPending(userId, orgId);
    return NextResponse.json({ pending, count: pending.length }, { status: 200 });
  } catch (error) {
    console.error("[API /workflow/pending]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
