import "server-only";
// ═══════════════════════════════════════════════════════════════
// FILE: lib/workflow/engine.ts
// The Approval Workflow Engine — Core Logic
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/prisma";
import { policyMatcher } from "./policyMatcher";
import { notifier } from "./notifier";
import { auditLogger } from "./auditLogger";
import { executor } from "./executor";
import { addWorkingDays, getHoursOverdue } from "./utils";
import { 
  WorkflowAction, 
  WorkflowContext, 
  WorkflowSubmitResult, 
  ApprovalDecision, 
  WorkflowDecideResult,
  WorkflowGetPendingResult,
  WorkflowGetStatusResult,
  ApprovalModule
} from "./types";

/**
 * SUBMIT — entry point for every action that needs approval
 * Returns: { status, requestId, message, nextApprover }
 */
async function submit(action: WorkflowAction, context: WorkflowContext): Promise<WorkflowSubmitResult> {
  // ── Step 1: Find matching policy ──────────────────────────
  const policy = await policyMatcher.find({
    orgId:      context.orgId,
    module:     action.module,
    amount:     action.amount,
    department: action.department,
  });

  // ── Step 2: Handle no policy found ────────────────────────
  if (!policy) {
    await auditLogger.log({
      action:   "NO_POLICY_MATCH",
      actor:    context.userId,
      orgId:    context.orgId,
      entity:   action.module,
      entityId: action.entityId,
      detail:   `No active approval policy found for ${action.module} amount ${action.amount} ${action.currency}`,
      severity: "WARNING",
    });

    await notifier.sendToRole({
      orgId:     context.orgId,
      role:      "superuser",
      type:      "ESCALATION",
      message:   `No approval policy found for ${action.entityRef} (${action.module}). Manual review required.`,
      entityId:  action.entityId,
      entityRef: action.entityRef,
    });

    await _updateEntityStatus(action.module, action.entityId, "PENDING_MANUAL_REVIEW");

    return {
      status:    "NO_POLICY",
      message:   "No matching approval policy found. Escalated to Platform Superuser for manual review.",
      requestId: undefined,
    };
  }

  // ── Step 3: Check auto-approve ────────────────────────────
  if (policy.auto_approve && action.amount <= (policy.auto_approve_limit || 0)) {
    await auditLogger.log({
      action:   "AUTO_APPROVED",
      actor:    "SYSTEM",
      orgId:    context.orgId,
      entity:   action.module,
      entityId: action.entityId,
      detail:   `Auto-approved: amount ${action.amount} ${action.currency} is below threshold ${policy.auto_approve_limit}`,
    });

    await executor.run(action.module, action.entityId, context.orgId);

    await notifier.sendToUser({
      orgId:     context.orgId,
      userId:    context.userId,
      type:      "REQUEST_COMPLETED",
      message:   `${action.entityRef} was auto-approved (amount below GHS ${policy.auto_approve_limit?.toLocaleString()} threshold).`,
      entityId:  action.entityId,
      entityRef: action.entityRef,
    });

    return {
      status:  "AUTO_APPROVED",
      message: `Auto-approved — amount is below the GHS ${policy.auto_approve_limit?.toLocaleString()} threshold.`,
    };
  }

  // ── Step 4: Create the approval request ───────────────────
  const request = await (prisma as any).approvalRequest.create({
    data: {
      org_id:         context.orgId,
      policy_id:      policy.id,
      entity_type:    action.module,
      entity_id:      action.entityId,
      entity_ref:     action.entityRef,
      entity_title:   action.entityTitle,
      amount:         action.amount,
      currency:       action.currency || "GHS",
      department:     action.department,
      requested_by:   context.userId,
      requester_name: context.userName,
      status:         "PENDING",
      current_step:   1,
      total_steps:    policy.steps?.length || 0,
      triggered_by:   action.source || "USER",
      ai_command_id:  action.aiCommandId || null,
    },
  });

  // ── Step 5: Create step records ───────────────────────────
  for (const step of (policy as any).steps) {
    await (prisma as any).approvalStepRecord.create({
      data: {
        org_id:        context.orgId,
        request_id:    request.id,
        step_number:   step.step_number,
        approver_role: step.role,
        status:        step.step_number === 1 ? "ACTIVE" : "WAITING",
        due_at:        addWorkingDays(new Date(), step.sla_days),
      },
    });
  }

  // ── Step 6: Update entity status ──────────────────────────
  await _updateEntityStatus(action.module, action.entityId, "PENDING_APPROVAL");

  // ── Step 7: Notify first approver(s) ──────────────────────
  const firstStep = (policy.steps || []).find((s: any) => s.step_number === 1);
  if (firstStep) {
    await notifier.sendToRole({
      orgId:         context.orgId,
      role:          firstStep.role,
      type:          "APPROVAL_REQUESTED",
      requestId:     request.id,
      entityRef:     action.entityRef,
      entityTitle:   action.entityTitle,
      amount:        action.amount,
      currency:      action.currency || "GHS",
      requesterName: context.userName,
      stepNumber:    1,
      totalSteps:    (policy.steps || []).length,
      dueAt:         addWorkingDays(new Date(), firstStep.sla_days),
      message:       `${action.entityRef} requires your approval (Step 1 of ${(policy.steps || []).length})`,
    });
  }

  // ── Step 8: Audit log ─────────────────────────────────────
  await auditLogger.log({
    action:   "APPROVAL_REQUESTED",
    actor:    context.userId,
    orgId:    context.orgId,
    entity:   action.module,
    entityId: action.entityId,
    detail:   `Approval request created. Policy: "${policy.name}". ${(policy.steps || []).length} step(s) required. Triggered by: ${action.source || "USER"}.`,
  });

  return {
    status:       "PENDING",
    requestId:    request.id,
    policyName:   policy.name,
    totalSteps:   (policy.steps || []).length,
    nextApprover: firstStep?.role_label,
    message:      `Submitted for approval. ${(policy.steps || []).length} step(s) required before this is executed. ${firstStep?.role_label || "Approver"} has been notified.`,
    aiMessage:    `I have submitted ${action.entityRef} for approval. It requires ${(policy.steps || []).length} approval(s) — first up is the ${firstStep?.role_label || "approver"}. I will notify you once it has been fully approved.`,
  };
}

/**
 * DECIDE — called when an approver approves or rejects
 */
async function decide(
  requestId: string, 
  approverId: string, 
  decision: ApprovalDecision, 
  comment?: string, 
  meta: { ipAddress?: string; userAgent?: string } = {}
): Promise<WorkflowDecideResult> {

  const request = await (prisma as any).approvalRequest.findUnique({
    where: { id: requestId },
    include: {
      step_records: { orderBy: { step_number: "asc" } },
      policy: { include: { steps: { orderBy: { step_number: "asc" } } } },
    },
  });

  if (!request) throw new Error(`Approval request ${requestId} not found.`);
  if (request.status === "FULLY_APPROVED") throw new Error("This request has already been fully approved.");
  if (request.status === "REJECTED") throw new Error("This request has already been rejected.");
  if (request.status === "CANCELLED") throw new Error("This request has been cancelled.");

  const currentStepRecord = request.step_records.find(
    (s: any) => s.step_number === request.current_step && s.status === "ACTIVE"
  );

  if (!currentStepRecord) {
    throw new Error(`No active step found at position ${request.current_step}.`);
  }

  const approver = await (prisma as any).user.findUnique({ where: { id: approverId } });
  if (!approver) throw new Error("Approver not found.");

  const hasPermission =
    approver.role === currentStepRecord.approver_role ||
    approver.role === "superuser";

  if (!hasPermission) {
    throw new Error(
      `You (${approver.role}) are not authorised to approve step ${request.current_step}. ` +
      `This step requires: ${currentStepRecord.approver_role}.`
    );
  }

  if (decision === "APPROVED") {
    await (prisma as any).approvalStepRecord.update({
      where: { id: currentStepRecord.id },
      data: {
        status:        "APPROVED",
        approver_id:   approverId,
        approver_name: approver.name,
        acted_at:      new Date(),
        comment:       comment || null,
        ip_address:    meta.ipAddress || null,
        user_agent:    meta.userAgent || null,
      },
    });

    await auditLogger.log({
      action:   "STEP_APPROVED",
      actor:    approverId,
      orgId:    request.org_id,
      entity:   request.entity_type,
      entityId: request.entity_id,
      detail:   `Step ${request.current_step} of ${request.total_steps} approved by ${approver.name} (${approver.role}). ${comment ? `Comment: "${comment}"` : ""}`,
    });

    await notifier.sendToUser({
      orgId:      request.org_id,
      userId:     request.requested_by,
      type:       "STEP_APPROVED",
      requestId:  request.id,
      entityRef:  request.entity_ref,
      message:    `Step ${request.current_step} of ${request.total_steps} approved by ${approver.name}.`,
      stepNumber: request.current_step,
      totalSteps: request.total_steps,
    });

    if (request.current_step < request.total_steps) {
      const nextStepNumber = request.current_step + 1;
      const nextPolicyStep = request.policy?.steps.find(
        (s: any) => s.step_number === nextStepNumber
      );

      const nextStepRecord = request.step_records.find((s: any) => s.step_number === nextStepNumber);
      if (nextStepRecord) {
        await (prisma as any).approvalStepRecord.update({
          where: { id: nextStepRecord.id },
          data: {
            status: "ACTIVE",
            due_at: addWorkingDays(new Date(), nextPolicyStep?.sla_days || 2),
          },
        });
      }

      await (prisma as any).approvalRequest.update({
        where: { id: request.id },
        data: {
          current_step: nextStepNumber,
          status:       "IN_PROGRESS",
        },
      });

      await notifier.sendToRole({
        orgId:         request.org_id,
        role:          nextPolicyStep?.role,
        type:          "APPROVAL_REQUESTED",
        requestId:     request.id,
        entityRef:     request.entity_ref,
        entityTitle:   request.entity_title,
        amount:        request.amount,
        currency:      request.currency,
        requesterName: request.requester_name,
        stepNumber:    nextStepNumber,
        totalSteps:    request.total_steps,
        dueAt:         addWorkingDays(new Date(), nextPolicyStep?.sla_days || 2),
        message:       `${request.entity_ref} requires your approval (Step ${nextStepNumber} of ${request.total_steps})`,
      });

      return {
        status:    "IN_PROGRESS",
        message:   `Step ${request.current_step} approved. Moving to step ${nextStepNumber} — ${nextPolicyStep?.role_label} has been notified.`,
        nextStep:  nextStepNumber,
        nextRole:  nextPolicyStep?.role_label,
      };

    } else {
      await (prisma as any).approvalRequest.update({
        where: { id: request.id },
        data: {
          status:       "FULLY_APPROVED",
          completed_at: new Date(),
        },
      });

      await auditLogger.log({
        action:   "FULLY_APPROVED",
        actor:    approverId,
        orgId:    request.org_id,
        entity:   request.entity_type as ApprovalModule,
        entityId: request.entity_id,
        detail:   `All ${request.total_steps} approval step(s) completed. Executing action.`,
      });

      const execResult = await executor.run(
        request.entity_type as ApprovalModule,
        request.entity_id,
        request.org_id,
        { requestId: request.id }
      );

      await notifier.sendToUser({
        orgId:     request.org_id,
        userId:    request.requested_by,
        type:      "REQUEST_COMPLETED",
        requestId: request.id,
        entityRef: request.entity_ref,
        message:   `${request.entity_ref} has been fully approved and executed.`,
      });

      return {
        status:     "FULLY_APPROVED",
        message:    `All approvals complete. ${request.entity_ref} has been executed.`,
        execResult,
      };
    }

  } else if (decision === "REJECTED") {
    await (prisma as any).approvalStepRecord.update({
      where: { id: currentStepRecord.id },
      data: {
        status:        "REJECTED",
        approver_id:   approverId,
        approver_name: approver.name,
        acted_at:      new Date(),
        comment:       comment || "No reason provided",
        ip_address:    meta.ipAddress || null,
      },
    });

    await (prisma as any).approvalRequest.update({
      where: { id: request.id },
      data: {
        status:        "REJECTED",
        rejected_by:   approverId,
        reject_reason: comment || "No reason provided",
        completed_at:  new Date(),
      },
    });

    await _updateEntityStatus(request.entity_type as ApprovalModule, request.entity_id, "REJECTED");

    await auditLogger.log({
      action:   "STEP_REJECTED",
      actor:    approverId,
      orgId:    request.org_id,
      entity:   request.entity_type as ApprovalModule,
      entityId: request.entity_id,
      detail:   `Step ${request.current_step} rejected by ${approver.name} (${approver.role}). Reason: "${comment || "No reason provided"}"`,
      severity: "WARNING",
    });

    await notifier.sendToUser({
      orgId:      request.org_id,
      userId:     request.requested_by,
      type:       "STEP_REJECTED",
      requestId:  request.id,
      entityRef:  request.entity_ref,
      message:    `${request.entity_ref} was rejected at step ${request.current_step} by ${approver.name}. Reason: "${comment || "No reason given"}".`,
    });

    return {
      status:     "REJECTED",
      message:    `${request.entity_ref} has been rejected at step ${request.current_step}. The requester has been notified.`,
      reason:     comment || "No reason provided",
      rejectedBy: approver.name,
    };
  }

  throw new Error(`Invalid decision: "${decision}". Must be "APPROVED" or "REJECTED".`);
}

/**
 * CANCEL — requester cancels their own pending request
 */
async function cancel(requestId: string, userId: string, reason?: string) {
  const request = await (prisma as any).approvalRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new Error("Request not found.");
  if (request.requested_by !== userId) throw new Error("Only the original requester can cancel this request.");
  if (["FULLY_APPROVED","REJECTED"].includes(request.status)) {
    throw new Error(`Cannot cancel a request that is already ${request.status.toLowerCase()}.`);
  }

  await (prisma as any).approvalRequest.update({
    where: { id: requestId },
    data:  { status: "CANCELLED", completed_at: new Date() },
  });

  await (prisma as any).approvalStepRecord.updateMany({
    where: { request_id: requestId, status: { in: ["WAITING","ACTIVE"] } },
    data:  { status: "SKIPPED" },
  });

  await _updateEntityStatus(request.entity_type as ApprovalModule, request.entity_id, "CANCELLED");

  await auditLogger.log({
    action:   "REQUEST_CANCELLED",
    actor:    userId,
    orgId:    request.org_id,
    entity:   request.entity_type as ApprovalModule,
    entityId: request.entity_id,
    detail:   `Approval request cancelled by requester. Reason: "${reason || "No reason given"}"`,
  });

  return { status: "CANCELLED", message: "Request cancelled successfully." };
}

/**
 * GET_PENDING — all pending requests for a user's role
 */
async function getPending(userId: string, orgId: string): Promise<WorkflowGetPendingResult[]> {
  const user = await (prisma as any).user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");

  const stepRecords = await (prisma as any).approvalStepRecord.findMany({
    where: {
      status:        "ACTIVE",
      approver_role: user.role,
      request: {
        org_id: orgId,
        status: { in: ["PENDING","IN_PROGRESS"] },
      },
    },
    include: {
      request: true,
    },
    orderBy: { due_at: "asc" },
  });

  return stepRecords.map((sr: any) => ({
    requestId:     sr.request.id,
    entityType:    sr.request.entity_type,
    entityId:      sr.request.entity_id,
    entityRef:     sr.request.entity_ref,
    entityTitle:   sr.request.entity_title,
    amount:        sr.request.amount,
    currency:      sr.request.currency,
    requesterName: sr.request.requester_name,
    stepNumber:    sr.step_number,
    totalSteps:    sr.request.total_steps,
    dueAt:         sr.due_at,
    isOverdue:     sr.due_at < new Date(),
    hoursOverdue:  sr.due_at < new Date() ? getHoursOverdue(sr.due_at) : 0,
    triggeredBy:   sr.request.triggered_by,
    createdAt:     sr.request.created_at,
  }));
}

/**
 * GET_STATUS — full status of a request
 */
async function getStatus(requestId: string): Promise<WorkflowGetStatusResult> {
  const request = await (prisma as any).approvalRequest.findUnique({
    where: { id: requestId },
    include: {
      step_records: { orderBy: { step_number: "asc" } },
      policy:       { include: { steps: true } },
    },
  });

  if (!request) throw new Error("Request not found.");

  return {
    id:            request.id,
    status:        request.status,
    entityType:    request.entity_type,
    entityId:      request.entity_id,
    entityRef:     request.entity_ref,
    entityTitle:   request.entity_title,
    amount:        request.amount,
    currency:      request.currency,
    currentStep:   request.current_step,
    totalSteps:    request.total_steps,
    policyName:    request.policy?.name,
    triggeredBy:   request.triggered_by,
    requesterName: request.requester_name,
    createdAt:     request.created_at,
    completedAt:   request.completed_at,
    rejectReason:  request.reject_reason,
    steps:         request.step_records.map((sr: any) => ({
      stepNumber:   sr.step_number,
      role:         sr.approver_role,
      status:       sr.status,
      approverName: sr.approver_name,
      actedAt:      sr.acted_at,
      comment:      sr.comment,
      dueAt:        sr.due_at,
      isOverdue:    sr.due_at < new Date() && sr.status === "ACTIVE",
    })),
  };
}

/**
 * Private: update the source entity's status
 */
async function _updateEntityStatus(module: ApprovalModule, entityId: string, status: string) {
  const map: Record<string, () => Promise<any>> = {
    REQUISITION:          () => (prisma as any).requisition.update({ where: { id: entityId }, data: { status } }),
    PURCHASE_ORDER:       () => (prisma as any).purchaseOrder.update({ where: { id: entityId }, data: { status } }),
    INVOICE:              () => (prisma as any).invoice.update({ where: { id: entityId }, data: { status } }),
    PAYMENT:              () => (prisma as any).payment.update({ where: { id: entityId }, data: { status } }),
    CONTRACT:             () => (prisma as any).contract.update({ where: { id: entityId }, data: { status } }),
    VENDOR:               () => (prisma as any).vendor.update({ where: { id: entityId }, data: { status } }),
    TENDER:               () => (prisma as any).tender.update({ where: { id: entityId }, data: { status } }),
    BUDGET_OVERRIDE:      () => (prisma as any).budgetOverride?.update({ where: { id: entityId }, data: { status } }),
    ASSET_DISPOSAL:       () => (prisma as any).asset.update({ where: { id: entityId }, data: { status } }),
    INVENTORY_ADJUSTMENT: () => (prisma as any).inventoryAdjustment?.update({ where: { id: entityId }, data: { status } }),
  };

  const fn = map[module];
  if (fn) {
    try { await fn(); } catch (e: any) {
      console.warn(`[WorkflowEngine] Could not update ${module} ${entityId} status to ${status}:`, e.message);
    }
  }
}

export const WorkflowEngine = {
  submit,
  decide,
  cancel,
  getPending,
  getStatus,
};
