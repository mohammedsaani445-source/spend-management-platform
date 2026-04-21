import "server-only";
// ═══════════════════════════════════════════════════════════════
// FILE: lib/workflow/auditLogger.ts
// Writes every approval event to the immutable audit trail
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/prisma";
import crypto from "crypto";

interface AuditLogOptions {
  action: string;
  actor: string;
  orgId: string;
  entity: string;
  entityId: string;
  detail: string;
  severity?: "INFO" | "WARNING" | "ERROR";
  metadata?: any;
}

export const auditLogger = {
  async log({ action, actor, orgId, entity, entityId, detail, severity = "INFO", metadata = {} }: AuditLogOptions) {
    // Create a hash of the log entry for tamper detection
    const entry = { action, actor, orgId, entity, entityId, detail, timestamp: new Date().toISOString() };
    const hash = crypto.createHash("sha256").update(JSON.stringify(entry)).digest("hex");

    await (prisma as any).auditLog.create({
      data: {
        action:    action,
        actor_id:  actor,
        org_id:    orgId,
        entity:    entity,
        entity_id: entityId,
        detail:    detail,
        severity:  severity,
        hash:      hash,
        metadata:  metadata,
      },
    });

    if (severity === "ERROR") {
      console.error(`[AuditLog] ${action} | ${entity} ${entityId} | ${detail}`);
    }
  },
};
