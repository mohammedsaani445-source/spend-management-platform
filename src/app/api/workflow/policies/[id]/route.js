// ═══════════════════════════════════════════════════════════════
// PATCH, PUT, DELETE /api/workflow/policies/[id]
// ═══════════════════════════════════════════════════════════════
import { NextResponse }     from "next/server";
import { prisma }           from "@/lib/prisma";
import { auditLogger }      from "@/lib/workflow/auditLogger";

// ── PATCH — update a policy ────────────────────────────────────
export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const {
      orgId, userId,
      name, description, module, department_scope,
      amount_min, amount_max,
      auto_approve, auto_approve_limit,
      active, priority, steps
    } = body;

    if (!orgId || !userId) return NextResponse.json({ error: "orgId and userId are required" }, { status: 401 });

    const existing = await prisma.approvalPolicy.findUnique({
      where: { id: params.id },
      include: { steps: true },
    });

    if (!existing) return NextResponse.json({ error: "Policy not found." }, { status: 404 });
    if (existing.org_id !== orgId) return NextResponse.json({ error: "Access denied." }, { status: 403 });

    // ── Pending requests warning ──
    let pendingWarning = null;
    if (active === false && existing.active === true) {
      const pendingCount = await prisma.approvalRequest.count({
        where: { policy_id: params.id, status: { in: ["PENDING", "IN_PROGRESS"] } },
      });
      if (pendingCount > 0) {
        pendingWarning = `Warning: ${pendingCount} request(s) in progress will complete normally.`;
      }
    }

    // ── Update policy ──
    const updated = await prisma.approvalPolicy.update({
      where: { id: params.id },
      data: {
        ...(name            !== undefined && { name: name.trim() }),
        ...(description     !== undefined && { description: description?.trim() }),
        ...(module          !== undefined && { module }),
        ...(department_scope !== undefined && { department_scope }),
        ...(amount_min      !== undefined && { amount_min }),
        ...(amount_max      !== undefined && { amount_max }),
        ...(auto_approve    !== undefined && { auto_approve }),
        ...(auto_approve_limit !== undefined && { auto_approve_limit }),
        ...(active          !== undefined && { active }),
        ...(priority        !== undefined && { priority }),
      },
    });

    // ── Replace steps if provided ──
    if (steps !== undefined) {
      await prisma.approvalPolicyStep.deleteMany({ where: { policy_id: params.id } });
      await prisma.approvalPolicyStep.createMany({
        data: steps.map(s => ({
          policy_id:   params.id,
          step_number: s.step_number,
          role:        s.role,
          role_label:  s.role_label || s.role,
          sla_days:    s.sla_days || 2,
          is_required: s.is_required ?? true,
          is_parallel: s.is_parallel ?? false,
        })),
      });
    }

    const fresh = await prisma.approvalPolicy.findUnique({
      where: { id: params.id },
      include: { steps: { orderBy: { step_number: "asc" } } },
    });

    await auditLogger.log({
      action: "POLICY_UPDATED", actor: userId, orgId, entity: "APPROVAL_POLICY",
      entityId: params.id,
      detail: `Policy "${fresh.name}" updated. Changed: ${Object.keys(body).filter(k => !["orgId","userId"].includes(k)).join(", ")}.`,
    });

    return NextResponse.json({ policy: fresh, pendingWarning, message: `Policy "${fresh.name}" updated.` });
  } catch (error) {
    console.error("[API PATCH /workflow/policies/:id]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── PUT toggle active status ────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const { active, orgId, userId } = await request.json();

    if (!orgId || !userId) return NextResponse.json({ error: "orgId and userId are required" }, { status: 401 });

    const updated = await prisma.approvalPolicy.update({
      where: { id: params.id },
      data:  { active },
    });

    let pendingWarning = null;
    if (!active) {
      const pendingCount = await prisma.approvalRequest.count({
        where: { policy_id: params.id, status: { in: ["PENDING", "IN_PROGRESS"] } },
      });
      if (pendingCount > 0) {
        pendingWarning = `${pendingCount} request(s) in progress will complete normally.`;
      }
    }

    await auditLogger.log({
      action: active ? "POLICY_ACTIVATED" : "POLICY_DEACTIVATED",
      actor: userId, orgId, entity: "APPROVAL_POLICY", entityId: params.id,
      detail: `Policy "${updated.name}" ${active ? "activated" : "deactivated"}.`,
    });

    return NextResponse.json({ active: updated.active, pendingWarning, message: `Policy "${updated.name}" is now ${active ? "active" : "inactive"}.` });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── DELETE a policy ───────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId  = searchParams.get("orgId");
    const userId = searchParams.get("userId");

    if (!orgId || !userId) return NextResponse.json({ error: "orgId and userId are required" }, { status: 401 });

    const policy = await prisma.approvalPolicy.findUnique({ where: { id: params.id } });
    if (!policy) return NextResponse.json({ error: "Policy not found." }, { status: 404 });
    if (policy.org_id !== orgId) return NextResponse.json({ error: "Access denied." }, { status: 403 });

    const pendingCount = await prisma.approvalRequest.count({
      where: { policy_id: params.id, status: { in: ["PENDING", "IN_PROGRESS"] } },
    });

    if (pendingCount > 0) {
      return NextResponse.json({
        error: `Cannot delete — ${pendingCount} request(s) in progress. Deactivate it instead.`,
        pendingCount,
      }, { status: 409 });
    }

    const policyName = policy.name;
    await prisma.approvalPolicyStep.deleteMany({ where: { policy_id: params.id } });
    await prisma.approvalPolicy.delete({ where: { id: params.id } });

    await auditLogger.log({
      action: "POLICY_DELETED", actor: userId, orgId, entity: "APPROVAL_POLICY",
      entityId: params.id, detail: `Policy "${policyName}" permanently deleted.`,
    });

    return NextResponse.json({ message: `Policy "${policyName}" deleted.` });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
