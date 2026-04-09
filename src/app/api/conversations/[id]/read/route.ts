import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.conversationParticipant.updateMany({
    where: { conversationId: id, userId: session.user.id },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
