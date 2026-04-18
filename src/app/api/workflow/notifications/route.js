// ─────────────────────────────────────────────────────────────
// GET /api/workflow/notifications — Unread notifications
// PUT /api/workflow/notifications — Mark as read
// ─────────────────────────────────────────────────────────────
import { NextResponse }    from "next/server";
import { prisma }          from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "userId query param is required" }, { status: 400 });

    const notifications = await prisma.approvalNotification.findMany({
      where: {
        recipient_id: userId,
        read_at:      null,
      },
      include: { request: true },
      orderBy: { sent_at: "desc" },
      take: 50,
    });

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id:         n.id,
        type:       n.type,
        message:    n.payload?.message,
        entityRef:  n.request?.entity_ref,
        entityType: n.request?.entity_type,
        requestId:  n.request_id,
        sentAt:     n.sent_at,
      })),
      unreadCount: notifications.length,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { notificationIds, userId } = await request.json();

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

    await prisma.approvalNotification.updateMany({
      where: {
        id:           { in: notificationIds },
        recipient_id: userId,
      },
      data: { read_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
