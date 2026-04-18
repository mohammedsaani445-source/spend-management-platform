// ═══════════════════════════════════════════════════════════════
// POST /api/workflow/simulate — Test what policy matches
// ═══════════════════════════════════════════════════════════════
import { NextResponse }     from "next/server";
import { policyMatcher }    from "@/lib/workflow/policyMatcher";

export async function POST(request) {
  try {
    const { orgId, module, amount, department } = await request.json();

    if (!orgId || !module || amount === undefined) {
      return NextResponse.json({ error: "orgId, module, and amount are required." }, { status: 400 });
    }

    const result = await policyMatcher.simulate({
      orgId,
      module,
      amount:     Number(amount),
      department: department || null,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
