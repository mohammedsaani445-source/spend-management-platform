// ─────────────────────────────────────────────────────────────
// POST /api/workflow/submit — Submit any entity for approval
// ─────────────────────────────────────────────────────────────
import { NextResponse }    from "next/server";
import { WorkflowEngine }  from "@/lib/workflow/engine";

export async function POST(request) {
  try {
    const body = await request.json();
    const { module, entityId, entityRef, entityTitle, amount, currency, department, source, aiCommandId, orgId, userId, userName, userRole } = body;

    if (!orgId || !userId) return NextResponse.json({ error: "orgId and userId are required" }, { status: 401 });
    if (!module || !entityId || amount === undefined) {
      return NextResponse.json({ error: "module, entityId, and amount are required" }, { status: 400 });
    }

    const result = await WorkflowEngine.submit(
      { module, entityId, entityRef, entityTitle, amount, currency, department, source: source || "USER", aiCommandId },
      { userId, userName, orgId, role: userRole }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API /workflow/submit]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
