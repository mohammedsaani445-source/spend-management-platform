// ═══════════════════════════════════════════════════════════════
// FILE: lib/workflow/notifier.js
// Sends notifications to approvers and requesters
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/prisma";

export const notifier = {

  // Send notification to all users with a specific role in the org
  async sendToRole({ orgId, role, type, requestId, message, ...data }) {
    const users = await prisma.user.findMany({
      where: { org_id: orgId, role: role, status: "ACTIVE" },
    });

    for (const user of users) {
      await this._createNotification({
        orgId,         // Pass orgId
        requestId,
        recipientId:   user.id,
        recipientRole: role,
        type,
        message,
        data,
      });
    }

    console.log(`[Notifier] Sent "${type}" to ${users.length} user(s) with role "${role}"`);
  },

  // Send notification to a specific user
  async sendToUser({ orgId, userId, type, requestId, message, ...data }) {
    await this._createNotification({
      orgId,
      requestId,
      recipientId: userId,
      recipientRole: "DIRECT", // Use a placeholder for direct user notifications
      type,
      message,
      data,
    });
  },

  async _createNotification({ orgId, requestId, recipientId, recipientRole, type, message, data }) {
    // 1. Create in-app notification record
    if (requestId) {
      await prisma.approvalNotification.create({
        data: {
          org_id:        orgId, // CRITICAL: ensure tenant path
          request_id:    requestId,
          recipient_id:  recipientId,
          recipient_role: recipientRole || "USER", // Fallback for undefined
          type:          type,
          channel:       "IN_APP",
          payload:       { message, ...data },
        },
      });
    }

    // 2. Real-time push via Server-Sent Events or WebSocket
    await _pushRealtime(recipientId, { type, message, requestId, ...data });

    // 3. Email notification (optional — plug in your email service here)
    // await _sendEmail(recipientId, type, message, data);
  },
};

async function _pushRealtime(userId, payload) {
  // ── Option A: Server-Sent Events ──────────────────────────
  // If you have an SSE endpoint, emit to the user's channel
  // global.sseClients?.[userId]?.write(`data: ${JSON.stringify(payload)}\n\n`);

  // ── Option B: Pusher / Ably ───────────────────────────────
  // await pusher.trigger(`user-${userId}`, "approval-update", payload);

  // ── Option C: Socket.io ───────────────────────────────────
  // global.io?.to(userId).emit("approval-update", payload);

  console.log(`[Notifier] Real-time push to user ${userId}:`, payload.type);
}
