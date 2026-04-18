// ─────────────────────────────────────────────────────────────
// POST /api/workflow/decide — Approve or Reject a pending step
// ─────────────────────────────────────────────────────────────
import { NextResponse }    from "next/server";
import { WorkflowEngine }  from "@/lib/workflow/engine";

export async function POST(request) {
  try {
    const body = await request.json();
    const { requestId, decision, comment, userId } = body;

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 401 });
    if (!requestId || !decision) {
      return NextResponse.json({ error: "requestId and decision are required" }, { status: 400 });
    }
    if (!["APPROVED","REJECTED"].includes(decision)) {
      return NextResponse.json({ error: "decision must be APPROVED or REJECTED" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    const result = await WorkflowEngine.decide(
      requestId,
      userId,
      decision,
      comment,
      { ipAddress: ip, userAgent: request.headers.get("user-agent") }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API /workflow/decide]", error);
    const status = error.message.includes("not authorised") ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
