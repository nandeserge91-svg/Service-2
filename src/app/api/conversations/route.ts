import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: session.user.id } } },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              image: true,
              sellerProfile: { select: { displayName: true } },
              buyerProfile: { select: { displayName: true } },
            },
          },
        },
      },
      service: { select: { id: true, title: true, slug: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, isSystem: true, createdAt: true, authorId: true },
      },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const userId = session.user.id;

  const data = conversations.map((conv) => {
    const myParticipant = conv.participants.find((p) => p.userId === userId);
    const otherParticipant = conv.participants.find((p) => p.userId !== userId);
    const lastMessage = conv.messages[0] ?? null;

    const lastReadAt = myParticipant?.lastReadAt;
    const unreadCount = lastReadAt
      ? 0 // will be computed below
      : conv._count.messages;

    return {
      id: conv.id,
      type: conv.type,
      service: conv.service,
      otherUser: otherParticipant
        ? {
            id: otherParticipant.user.id,
            name:
              otherParticipant.user.sellerProfile?.displayName ??
              otherParticipant.user.buyerProfile?.displayName ??
              otherParticipant.user.email,
            image: otherParticipant.user.image,
          }
        : null,
      lastMessage: lastMessage
        ? {
            body: lastMessage.body,
            isSystem: lastMessage.isSystem,
            createdAt: lastMessage.createdAt,
            isMine: lastMessage.authorId === userId,
          }
        : null,
      lastReadAt,
      updatedAt: conv.updatedAt,
    };
  });

  // Batch unread counts
  const unreadCounts = await Promise.all(
    conversations.map(async (conv) => {
      const myP = conv.participants.find((p) => p.userId === userId);
      if (!myP?.lastReadAt) {
        return { id: conv.id, count: conv._count.messages };
      }
      return {
        id: conv.id,
        count: await prisma.message.count({
          where: {
            conversationId: conv.id,
            createdAt: { gt: myP.lastReadAt },
            authorId: { not: userId },
          },
        }),
      };
    }),
  );

  const unreadMap = Object.fromEntries(unreadCounts.map((u) => [u.id, u.count]));

  return NextResponse.json({
    data: data.map((d) => ({ ...d, unreadCount: unreadMap[d.id] ?? 0 })),
  });
}
