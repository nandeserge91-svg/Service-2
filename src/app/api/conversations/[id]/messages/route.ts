import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: session.user.id } },
  });
  if (!participant) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor");
  const take = 50;

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          image: true,
          sellerProfile: { select: { displayName: true } },
          buyerProfile: { select: { displayName: true } },
        },
      },
      attachments: true,
    },
    orderBy: { createdAt: "asc" },
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    take,
  });

  const data = messages.map((m) => ({
    id: m.id,
    body: m.body,
    isSystem: m.isSystem,
    createdAt: m.createdAt,
    author: {
      id: m.author.id,
      name:
        m.author.sellerProfile?.displayName ??
        m.author.buyerProfile?.displayName ??
        m.author.email,
      image: m.author.image,
    },
    isMine: m.author.id === session.user.id,
    attachments: m.attachments.map((a) => ({
      id: a.id,
      fileUrl: a.fileUrl,
      mimeType: a.mimeType,
      sizeBytes: a.sizeBytes,
    })),
  }));

  return NextResponse.json({
    data,
    nextCursor: messages.length === take ? messages[messages.length - 1].id : null,
  });
}
