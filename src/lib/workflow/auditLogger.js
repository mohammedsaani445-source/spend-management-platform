// ═══════════════════════════════════════════════════════════════
// FILE: lib/workflow/auditLogger.js
// Writes every approval event to the immutable audit trail
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/prisma";
import crypto      from "crypto";

export const auditLogger = {

  async log({ action, actor, orgId, entity, entityId, detail, severity = "INFO", metadata = {} }) {
    // Create a hash of the log entry for tamper detection
    const entry = { action, actor, orgId, entity, entityId, detail, timestamp: new Date().toISOString() };
    const hash  = crypto.createHash("sha256").update(JSON.stringify(entry)).digest("hex");

    await prisma.auditLog.create({
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
