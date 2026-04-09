import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/notifications/read — mark notifications as read.
 * Body: { ids: string[] } — mark specific ones.
 * Body: { all: true } — mark all unread.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const now = new Date();

  if (body.all === true) {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: now },
    });
  } else if (Array.isArray(body.ids) && body.ids.length > 0) {
    await prisma.notification.updateMany({
      where: {
        id: { in: body.ids },
        userId: session.user.id,
        readAt: null,
      },
      data: { readAt: now },
    });
  }

  const count = await prisma.notification.count({
    where: { userId: session.user.id, readAt: null },
  });

  return NextResponse.json({ ok: true, unreadCount: count });
}
