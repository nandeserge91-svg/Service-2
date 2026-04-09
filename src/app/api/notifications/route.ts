import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * GET /api/notifications — paginated list of notifications.
 * Query params:
 *   cursor  — last notification id for pagination
 *   limit   — max items (default 20, cap 50)
 *   status  — "unread" | "read" | "all" (default "all")
 *   search  — text search in title/body
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const url = request.nextUrl;
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);
  const status = url.searchParams.get("status") ?? "all";
  const search = url.searchParams.get("search")?.trim() ?? "";

  const where: Prisma.NotificationWhereInput = { userId: session.user.id };

  if (status === "unread") where.readAt = null;
  else if (status === "read") where.readAt = { not: null };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { body: { contains: search, mode: "insensitive" } },
    ];
  }

  const [notifications, totalCount, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    prisma.notification.count({ where: { userId: session.user.id } }),
    prisma.notification.count({ where: { userId: session.user.id, readAt: null } }),
  ]);

  const hasMore = notifications.length > limit;
  const items = hasMore ? notifications.slice(0, limit) : notifications;

  return NextResponse.json({
    items: items.map((n) => ({
      id: n.id,
      channel: n.channel,
      title: n.title,
      body: n.body,
      data: n.dataJson,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    })),
    nextCursor: hasMore ? items[items.length - 1].id : null,
    totalCount,
    unreadCount,
  });
}
