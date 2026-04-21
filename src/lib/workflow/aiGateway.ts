import "server-only";
// ═══════════════════════════════════════════════════════════════
// FILE: lib/workflow/aiGateway.ts
// Connects the AI Analyst to the Workflow Engine
// ═══════════════════════════════════════════════════════════════

import { WorkflowEngine } from "./engine";
import { ApprovalModule } from "./types";
import { prisma } from "@/lib/prisma";

export interface AIActionContext {
  userId: string;
  userName: string;
  role: string;
  orgId: string;
  department?: string;
}

export interface AICommand {
  id?: string;
  intent: string;
  entityData: any;
  reasoning: string;
  confidence: number;
}

export const aiGateway = {
  /**
   * Intercepts natural language queries to see if they imply an action
   * that should be routed through the workflow engine.
   */
  async intercept(params: {
    tenantId: string;
    query: string;
    userId: string;
    userName: string;
    role: string;
    department?: string;
  }) {
    const { tenantId, query, userId, userName, role, department } = params;
    
    console.log(`[aiGateway] Intercepting query: "${query}" for org ${tenantId}`);

    // This is a simplified regex-based intent detector.
    // In production, this would call a small LLM (Flash) to classify the intent.
    const queryLower = query.toLowerCase();
    
    let intent: string | null = null;
    let extractedId: string | null = null;

    if (queryLower.includes("create po") || queryLower.includes("generate purchase order")) {
      intent = "CREATE_PURCHASE_ORDER";
    } else if (queryLower.includes("approve invoice") || queryLower.includes("pay invoice")) {
      intent = "APPROVE_INVOICE";
      const match = query.match(/[A-Z0-9-]{6,}/i);
      if (match) extractedId = match[0];
    } else if (queryLower.includes("publish tender") || queryLower.includes("open bid")) {
      intent = "PUBLISH_TENDER";
    }

    if (!intent) return { intercepted: false };

    // If we have an intent, we normally would extract entity data here.
    // For this migration, we'll return a message asking for confirmation or 
    // simulating a successful submission if enough data is present.
    
    // Simulation: if it's "create po", we mock the command
    const aiCommand: AICommand = {
      intent: intent,
      reasoning: "Action requested via natural language interface.",
      confidence: 0.9,
      entityData: {
        amount: 5000, // Simulated
        currency: "GHS",
        department: department || "Operations",
        title: `AI Generated Action: ${intent}`,
        entityId: extractedId
      }
    };

    const context: AIActionContext = { userId, userName, orgId: tenantId, role, department };

    try {
      const result = await this.executeCommand(aiCommand, context);
      const response = (result as any).aiResponse || result.message;
      return {
        intercepted: true,
        response,
        requestId: (result as any).requestId,
        status: result.status
      };
    } catch (error: any) {
      console.error("[aiGateway] Failed to execute intercepted command:", error);
      return {
        intercepted: true,
        response: `I tried to process your request to ${intent.toLowerCase().replace(/_/g, " ")}, but I encountered an error: ${error.message}`,
        status: "ERROR"
      };
    }
  },

  // Call this when the AI wants to execute any procurement action
  async executeCommand(aiCommand: AICommand, context: AIActionContext) {
    // Map AI intent to workflow module
    const moduleMap: Record<string, ApprovalModule> = {
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
        status:     "UNKNOWN_INTENT",
        message:    `I don't know how to execute the intent: "${aiCommand.intent}". No action was taken.`,
        aiResponse: `I don't know how to execute the intent: "${aiCommand.intent}". No action was taken.`,
      };
    }

    // Create the entity record in DRAFT/PENDING_APPROVAL state first
    const entity = await _createDraftEntity(module, aiCommand.entityData, context);

    // Submit through the workflow engine
    const result = await WorkflowEngine.submit(
      {
        module,
        entityId:    entity.id,
        entityRef:   entity.ref || entity.id,
        entityTitle: aiCommand.entityData.title || aiCommand.entityData.description || `AI Action: ${module}`,
        amount:      aiCommand.entityData.amount || 0,
        currency:    aiCommand.entityData.currency || "GHS",
        department:  aiCommand.entityData.department || context.department || "General",
        source:      "AI",
        aiCommandId: aiCommand.id,
      },
      {
        userId:   context.userId,
        userName: context.userName,
        orgId:    context.orgId,
        role:     context.role
      }
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

async function _createDraftEntity(module: ApprovalModule, data: any, context: AIActionContext) {
  switch (module) {
    case "PURCHASE_ORDER":
      return (prisma as any).purchaseOrder.create({
        data: {
          ...data,
          org_id:       context.orgId,
          status:       "PENDING_APPROVAL",
          generated_by: "AI",
        },
      });

    case "INVOICE":
      // If we are approving an existing invoice
      if (data.entityId) {
        return (prisma as any).invoice.update({
          where: { id: data.entityId },
          data:  { status: "PENDING_APPROVAL" },
        });
      }
      // Otherwise create a new (unlikely for AI without OCR but possible)
      return (prisma as any).invoice.create({
        data: {
          ...data,
          org_id: context.orgId,
          status: "PENDING_APPROVAL"
        }
      });

    default:
      // For others, we might just mock or find the entity
      return { id: data.entityId || "mock-id", ref: data.entityRef || "AI-REQ-001" };
  }
}
