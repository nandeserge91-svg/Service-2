import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * SSE endpoint for real-time notification push.
 *
 * Clients connect via EventSource. The server polls the DB every 5s
 * for new notifications since the last check and pushes them as events.
 *
 * Production improvement: replace polling with pg LISTEN/NOTIFY or Redis pub/sub.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      }

      // Send initial unread count
      const initialCount = await prisma.notification.count({
        where: { userId, readAt: null },
      });
      send("unread_count", { count: initialCount });

      let lastCheck = new Date();

      const interval = setInterval(async () => {
        if (closed) {
          clearInterval(interval);
          return;
        }

        try {
          const fresh = await prisma.notification.findMany({
            where: { userId, createdAt: { gt: lastCheck } },
            orderBy: { createdAt: "asc" },
            take: 20,
          });

          if (fresh.length > 0) {
            for (const n of fresh) {
              send("notification", {
                id: n.id,
                title: n.title,
                body: n.body,
                data: n.dataJson,
                createdAt: n.createdAt.toISOString(),
              });
            }

            const unreadCount = await prisma.notification.count({
              where: { userId, readAt: null },
            });
            send("unread_count", { count: unreadCount });
          }

          lastCheck = new Date();
        } catch {
          // DB error during poll — skip this cycle
        }
      }, 5000);

      // Keep-alive ping every 30s
      const ping = setInterval(() => {
        if (closed) {
          clearInterval(ping);
          return;
        }
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch {
          closed = true;
          clearInterval(ping);
        }
      }, 30000);

      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        clearInterval(ping);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
