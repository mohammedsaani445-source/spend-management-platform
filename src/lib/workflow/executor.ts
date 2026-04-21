import "server-only";
// ═══════════════════════════════════════════════════════════════
// FILE: lib/workflow/executor.ts
// Executes the actual action AFTER all approvals pass
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/prisma";
import { auditLogger } from "./auditLogger";
import { ApprovalModule } from "./types";

export const executor = {
  async run(module: ApprovalModule, entityId: string, orgId: string, meta: { requestId?: string } = {}) {
    console.log(`[Executor] Running ${module} for entity ${entityId}`);

    try {
      let result;

      switch (module) {
        case "REQUISITION":
          result = await _executeRequisition(entityId, orgId);
          break;

        case "PURCHASE_ORDER":
          result = await _executePurchaseOrder(entityId, orgId);
          break;

        case "INVOICE":
          result = await _executeInvoice(entityId, orgId);
          break;

        case "PAYMENT":
          result = await _executePayment(entityId, orgId);
          break;

        case "CONTRACT":
          result = await _executeContract(entityId, orgId);
          break;

        case "VENDOR":
          result = await _executeVendorApproval(entityId, orgId);
          break;

        case "TENDER":
          result = await _executeTender(entityId, orgId);
          break;

        case "BUDGET_OVERRIDE":
          result = await _executeBudgetOverride(entityId, orgId);
          break;

        case "ASSET_DISPOSAL":
          result = await _executeAssetDisposal(entityId, orgId);
          break;

        default:
          throw new Error(`Unknown module type: ${module}`);
      }

      await auditLogger.log({
        action:   `${module}_EXECUTED`,
        actor:    "SYSTEM",
        orgId:    orgId,
        entity:   module,
        entityId: entityId,
        detail:   `Action executed after full approval chain. RequestId: ${meta.requestId || "N/A"}`,
      });

      return result;

    } catch (error: any) {
      console.error(`[Executor] Failed to execute ${module} ${entityId}:`, error);
      await auditLogger.log({
        action:   `${module}_EXECUTION_FAILED`,
        actor:    "SYSTEM",
        orgId:    orgId,
        entity:   module,
        entityId: entityId,
        detail:   `Execution failed: ${error.message}`,
        severity: "ERROR",
      });
      throw error;
    }
  },
};

// ── Individual executors ──────────────────────────────────────

async function _executeRequisition(entityId: string, orgId: string) {
  const req = await (prisma as any).requisition.update({
    where: { id: entityId },
    data:  { status: "APPROVED", approved_at: new Date() },
  });

  const po = await (prisma as any).purchaseOrder.create({
    data: {
      org_id:          orgId,
      requisition_id:  entityId,
      vendor_id:       req.preferred_vendor_id,
      department:      req.department,
      amount:          req.total_amount,
      currency:        req.currency,
      status:          "ISSUED",
      generated_by:    "SYSTEM",
      po_ref:          await _generateRef(orgId, "PO"),
      items:           req.items,
      notes:           `Auto-generated from ${req.ref}`,
      issued_at:       new Date(),
    },
  });

  return { requisitionStatus: "APPROVED", poGenerated: po.id, poRef: po.po_ref };
}

async function _executePurchaseOrder(entityId: string, orgId: string) {
  await (prisma as any).purchaseOrder.update({
    where: { id: entityId },
    data:  { status: "APPROVED", approved_at: new Date() },
  });
  return { status: "APPROVED", poId: entityId };
}

async function _executeInvoice(entityId: string, orgId: string) {
  const invoice = await (prisma as any).invoice.update({
    where: { id: entityId },
    data:  { status: "APPROVED", approved_at: new Date() },
  });

  await (prisma as any).payment.create({
    data: {
      org_id:     orgId,
      invoice_id: entityId,
      vendor_id:  invoice.vendor_id,
      amount:     invoice.amount,
      currency:   invoice.currency,
      status:     "SCHEDULED",
      due_date:   invoice.due_date,
      payment_ref: await _generateRef(orgId, "PAY"),
    },
  });

  return { status: "APPROVED", paymentScheduled: true };
}

async function _executePayment(entityId: string, orgId: string) {
  await (prisma as any).payment.update({
    where: { id: entityId },
    data:  { status: "PROCESSING", processed_at: new Date() },
  });
  return { status: "PROCESSING" };
}

async function _executeContract(entityId: string, orgId: string) {
  await (prisma as any).contract.update({
    where: { id: entityId },
    data:  { status: "ACTIVE", activated_at: new Date() },
  });
  return { status: "ACTIVE" };
}

async function _executeVendorApproval(entityId: string, orgId: string) {
  await (prisma as any).vendor.update({
    where: { id: entityId },
    data:  { status: "ACTIVE", approved_at: new Date() },
  });
  return { status: "ACTIVE" };
}

async function _executeTender(entityId: string, orgId: string) {
  await (prisma as any).tender.update({
    where: { id: entityId },
    data:  { status: "PUBLISHED", published_at: new Date() },
  });
  return { status: "PUBLISHED" };
}

async function _executeBudgetOverride(entityId: string, orgId: string) {
  await (prisma as any).budgetOverride?.update({
    where: { id: entityId },
    data:  { status: "APPROVED", approved_at: new Date() },
  });
  return { status: "APPROVED" };
}

async function _executeAssetDisposal(entityId: string, orgId: string) {
  await (prisma as any).asset.update({
    where: { id: entityId },
    data:  { status: "DISPOSED", disposed_at: new Date() },
  });
  return { status: "DISPOSED" };
}

async function _generateRef(orgId: string, prefix: string): Promise<string> {
  const year  = new Date().getFullYear();
  const count = await (prisma as any).approvalRequest.count({ where: { org_id: orgId } });
  return `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;
}
