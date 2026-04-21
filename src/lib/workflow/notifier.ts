import "server-only";
// ═══════════════════════════════════════════════════════════════
// FILE: lib/workflow/notifier.ts
// Sends notifications to approvers and requesters
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/prisma";
import { ApproverRole, NotificationType } from "./types";

interface SendToRoleOptions {
  orgId: string;
  role: ApproverRole;
  type: NotificationType;
  requestId?: string;
  message: string;
  [key: string]: any;
}

interface SendToUserOptions {
  orgId: string;
  userId: string;
  type: NotificationType;
  requestId?: string;
  message: string;
  [key: string]: any;
}

interface CreateNotificationOptions {
  orgId: string;
  requestId?: string;
  recipientId: string;
  recipientRole: string;
  type: NotificationType;
  message: string;
  data: any;
}

export const notifier = {
  // Send notification to all users with a specific role in the org
  async sendToRole({ orgId, role, type, requestId, message, ...data }: SendToRoleOptions) {
    const users = await (prisma as any).user.findMany({
      where: { org_id: orgId, role: role, status: "ACTIVE" },
    }) || [];

    if (users && Array.isArray(users)) {
      for (const user of users) {
        if (user && user.id) {
          await this._createNotification({
            orgId,
            requestId,
            recipientId:   user.id,
            recipientRole: role,
            type,
            message,
            data,
          });
        }
      }
    }

    const count = Array.isArray(users) ? users.length : 0;
    console.log(`[Notifier] Sent "${type}" to ${count} user(s) with role "${role}"`);
  },

  // Send notification to a specific user
  async sendToUser({ orgId, userId, type, requestId, message, ...data }: SendToUserOptions) {
    await this._createNotification({
      orgId,
      requestId,
      recipientId: userId,
      recipientRole: "DIRECT",
      type,
      message,
      data,
    });
  },

  async _createNotification({ orgId, requestId, recipientId, recipientRole, type, message, data }: CreateNotificationOptions) {
    // 1. Create in-app notification record
    if (requestId) {
      await (prisma as any).approvalNotification.create({
        data: {
          org_id:        orgId,
          request_id:    requestId,
          recipient_id:  recipientId,
          recipient_role: recipientRole || "USER",
          type:          type,
          channel:       "IN_APP",
          payload:       { message, ...data },
        },
      });
    }

    // 2. Real-time push logic
    await _pushRealtime(recipientId, { type, message, requestId, ...data });
  },
};

async function _pushRealtime(userId: string, payload: any) {
  // Implementation for real-time delivery (SSE, Pusher, etc. would go here)
  console.log(`[Notifier] Real-time push to user ${userId}:`, payload.type);
}
