// ═══════════════════════════════════════════════════════════════
// GET /api/workflow/policies — Load all policies for Configurator
// POST /api/workflow/policies — Create a new policy
// ═══════════════════════════════════════════════════════════════
import { NextResponse }     from "next/server";
import { prisma }           from "@/lib/prisma";
import { policyMatcher }    from "@/lib/workflow/policyMatcher";
import { auditLogger }      from "@/lib/workflow/auditLogger";

// ── GET all policies for this org ─────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) return NextResponse.json({ error: "orgId query param is required" }, { status: 400 });

    const policies = await policyMatcher.getAll(orgId);
    const coverage = await policyMatcher.checkCoverage(orgId);

    return NextResponse.json({ policies, coverage }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── POST create a new policy ──────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      orgId, userId, userRole,
      name, description, module, department_scope,
      amount_min, amount_max,
      auto_approve, auto_approve_limit,
      active, steps
    } = body;

    if (!orgId || !userId) return NextResponse.json({ error: "orgId and userId are required" }, { status: 401 });

    // ── Validation ────────────────────────────────────────────
    if (!name?.trim())   return NextResponse.json({ error: "Policy name is required." }, { status: 400 });
    if (!module)         return NextResponse.json({ error: "Module is required." }, { status: 400 });
    if (!steps?.length)  return NextResponse.json({ error: "At least one approval step is required." }, { status: 400 });
    if (amount_min > amount_max) return NextResponse.json({ error: "Min amount cannot be greater than max amount." }, { status: 400 });

    for (const step of steps) {
      if (!step.role)     return NextResponse.json({ error: `Step ${step.step_number}: approver role is required.` }, { status: 400 });
      if (!step.sla_days) return NextResponse.json({ error: `Step ${step.step_number}: SLA days is required.` }, { status: 400 });
    }

    // ── Check for overlapping policies ────────────────────────
    const overlaps = await prisma.approvalPolicy.findMany({
      where: {
        org_id:     orgId,
        module:     module,
        active:     true,
        amount_min: { lte: amount_max ?? 999999999 },
        amount_max: { gte: amount_min ?? 0 },
        OR: [
          { department_scope: "ALL" },
          { department_scope: department_scope || "ALL" },
        ],
      },
    });

    // ── Create the policy with all its steps ──────────────────
    const policy = await prisma.approvalPolicy.create({
      data: {
        org_id:             orgId,
        name:               name.trim(),
        description:        description?.trim() || null,
        module:             module,
        department_scope:   department_scope || "ALL",
        amount_min:         amount_min ?? 0,
        amount_max:         amount_max ?? 999999999,
        auto_approve:       auto_approve ?? false,
        auto_approve_limit: auto_approve ? (auto_approve_limit ?? 0) : null,
        active:             active ?? true,
        priority:           0,
        created_by:         userId,
        steps: {
          create: steps.map(s => ({
            step_number:  s.step_number,
            role:         s.role,
            role_label:   s.role_label || s.role,
            sla_days:     s.sla_days || 2,
            is_required:  s.is_required ?? true,
            is_parallel:  s.is_parallel ?? false,
          })),
        },
      },
      include: {
        steps: { orderBy: { step_number: "asc" } },
      },
    });

    await auditLogger.log({
      action:   "POLICY_CREATED",
      actor:    userId,
      orgId:    orgId,
      entity:   "APPROVAL_POLICY",
      entityId: policy.id,
      detail:   `New approval policy created: "${policy.name}" | Module: ${module} | Amount: ${amount_min ?? 0}–${amount_max ?? "unlimited"} | Steps: ${steps.length}`,
    });

    return NextResponse.json({
      policy,
      overlaps: overlaps.length > 0 ? {
        count:    overlaps.length,
        warning:  `${overlaps.length} existing policy/policies also cover this module and amount range.`,
        policies: overlaps.map(o => ({ id: o.id, name: o.name, priority: o.priority })),
      } : null,
      message: `Policy "${policy.name}" created successfully. It is immediately live.`,
    }, { status: 201 });
  } catch (error) {
    console.error("[API POST /workflow/policies]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
