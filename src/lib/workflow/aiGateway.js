// ═══════════════════════════════════════════════════════════════
// FILE: lib/workflow/aiGateway.js
// Connects the AI Analyst to the Workflow Engine
// ═══════════════════════════════════════════════════════════════
// When the AI wants to execute a command that affects real data,
// it MUST call this gateway — which routes through the engine.
// ═══════════════════════════════════════════════════════════════
import { WorkflowEngine } from "./engine";

export const aiGateway = {

  // Call this when the AI wants to execute any procurement action
  async executeCommand(aiCommand, context) {
    /*
      aiCommand = {
        intent:      "CREATE_PURCHASE_ORDER",
        entityData:  { vendor: "...", amount: 50000, ... },
        reasoning:   "Based on the approved requisition PR-2026-0041...",
        confidence:  0.95,
      }
      context = { userId, userName, orgId, role }
    */

    // Map AI intent to workflow module
    const moduleMap = {
      "CREATE_PURCHASE_ORDER":   "PURCHASE_ORDER",
      "APPROVE_INVOICE":         "INVOICE",
      "SCHEDULE_PAYMENT":        "PAYMENT",
      "ACTIVATE_CONTRACT":       "CONTRACT",
      "PUBLISH_TENDER":          "TENDER",
      "APPROVE_VENDOR":          "VENDOR",
      "OVERRIDE_BUDGET":         "BUDGET_OVERRIDE",
      "DISPOSE_ASSET":           "ASSET_DISPOSAL",
    };

    const module = moduleMap[aiCommand.intent];
    if (!module) {
      return {
        status:  "UNKNOWN_INTENT",
        message: `I don't know how to execute the intent: "${aiCommand.intent}". No action was taken.`,
      };
    }

    // Create the entity record in DRAFT/PENDING_APPROVAL state first
    const entity = await _createDraftEntity(module, aiCommand.entityData, context);

    // Submit through the workflow engine
    const result = await WorkflowEngine.submit(
      {
        module,
        entityId:    entity.id,
        entityRef:   entity.ref,
        entityTitle: aiCommand.entityData.title || aiCommand.entityData.description,
        amount:      aiCommand.entityData.amount || 0,
        currency:    aiCommand.entityData.currency || "GHS",
        department:  aiCommand.entityData.department,
        source:      "AI",
        aiCommandId: aiCommand.id,
      },
      context
    );

    // Return AI-friendly response
    return {
      ...result,
      aiResponse: result.aiMessage || result.message,
      entityRef:  entity.ref,
      entityId:   entity.id,
      reasoning:  aiCommand.reasoning,
    };
  },
};

async function _createDraftEntity(module, data, context) {
  // This creates the entity in a PENDING_APPROVAL state
  // so it exists in the DB but hasn't been executed yet
  const { prisma } = await import("@/lib/prisma");

  switch (module) {
    case "PURCHASE_ORDER":
      return prisma.purchaseOrder.create({
        data: {
          ...data,
          org_id:      context.orgId,
          status:      "PENDING_APPROVAL",
          generated_by: "AI",
        },
      });

    case "INVOICE":
      return prisma.invoice.update({
        where: { id: data.entityId },
        data:  { status: "PENDING_APPROVAL" },
      });

    default:
      throw new Error(`Cannot create draft entity for module: ${module}`);
  }
}
