// ═══════════════════════════════════════════════════════════════
// FILE: app/api/cron/workflow-sla/route.js
// Runs every hour to check SLA breaches and escalate
// ═══════════════════════════════════════════════════════════════
// Set up in vercel.json:
// {
//   "crons": [{ "path": "/api/cron/workflow-sla", "schedule": "0 * * * *" }]
// }
// ═══════════════════════════════════════════════════════════════
import { NextResponse }     from "next/server";
import { prisma }           from "@/lib/prisma";
import { notifier }         from "@/lib/workflow/notifier";
import { auditLogger }      from "@/lib/workflow/auditLogger";
import { getHoursOverdue }  from "@/lib/workflow/utils";

export async function GET(request) {
  // Protect cron endpoint
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  console.log("[SLA Cron] Starting SLA check...");

  // ── Find all overdue active steps ─────────────────────────
  const overdueSteps = await prisma.approvalStepRecord.findMany({
    where: {
      status: "ACTIVE",
      due_at: { lt: new Date() },
    },
    include: {
      request: { include: { policy: { include: { steps: true } } } },
    },
  });

  console.log(`[SLA Cron] Found ${overdueSteps.length} overdue step(s)`);

  let escalated = 0;
  let warned    = 0;

  for (const step of overdueSteps) {
    const hoursOver = getHoursOverdue(step.due_at);
    const req       = step.request;

    // ── Hard escalation: >48 hours overdue ───────────────────
    if (hoursOver >= 48) {
      // Mark step as escalated
      await prisma.approvalStepRecord.update({
        where: { id: step.id },
        data:  { status: "ESCALATED" },
      });

      // Mark request as escalated
      await prisma.approvalRequest.update({
        where: { id: req.id },
        data:  { status: "ESCALATED" },
      });

      // Notify Platform Superuser
      await notifier.sendToRole({
        orgId:     req.org_id,
        role:      "superuser",
        type:      "SLA_BREACHED",
        requestId: req.id,
        message:   `ESCALATED: ${req.entity_ref} has been waiting ${hoursOver}h for ${step.approver_role} approval. Immediate action required.`,
        entityRef: req.entity_ref,
        hoursOverdue: hoursOver,
      });

      await auditLogger.log({
        action:   "SLA_ESCALATED",
        actor:    "SYSTEM",
        orgId:    req.org_id,
        entity:   req.entity_type,
        entityId: req.entity_id,
        detail:   `Step ${step.step_number} escalated to superuser — ${hoursOver}h overdue. Approver role: ${step.approver_role}`,
        severity: "WARNING",
      });

      escalated++;

    // ── Soft warning: 4 hours before deadline ────────────────
    } else if (hoursOver >= -4 && hoursOver < 0) {
      await notifier.sendToRole({
        orgId:     req.org_id,
        role:      step.approver_role,
        type:      "SLA_WARNING",
        requestId: req.id,
        message:   `Reminder: ${req.entity_ref} requires your approval in less than 4 hours. Please review now.`,
        entityRef: req.entity_ref,
        dueAt:     step.due_at,
      });
      warned++;
    }
  }

  // ── Find requests stuck with no active step ───────────────
  const stuckRequests = await prisma.approvalRequest.findMany({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
      updated_at: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // 7 days old
    },
    take: 20,
  });

  for (const req of stuckRequests) {
    await notifier.sendToRole({
      orgId:     req.org_id,
      role:      "superuser",
      type:      "ESCALATION",
      requestId: req.id,
      message:   `STUCK: ${req.entity_ref} has been in ${req.status} for 7+ days. Please review.`,
      entityRef: req.entity_ref,
    });
  }

  console.log(`[SLA Cron] Done. Escalated: ${escalated}, Warned: ${warned}, Stuck: ${stuckRequests.length}`);

  return NextResponse.json({
    success:   true,
    escalated,
    warned,
    stuck:     stuckRequests.length,
    checkedAt: new Date().toISOString(),
  });
}
