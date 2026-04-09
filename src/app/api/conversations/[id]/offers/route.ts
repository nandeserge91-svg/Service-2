import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId: id, userId: session.user.id },
    },
  });
  if (!participant) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const offers = await prisma.offer.findMany({
    where: { conversationId: id },
    include: {
      seller: {
        select: {
          sellerProfile: { select: { displayName: true } },
          buyerProfile: { select: { displayName: true } },
        },
      },
      orders: { select: { id: true, status: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = offers.map((o) => ({
    id: o.id,
    status: o.status,
    title: o.title,
    description: o.description,
    amountMinor: o.amountMinor.toString(),
    currency: o.currency,
    deliveryDays: o.deliveryDays,
    revisions: o.revisions,
    expiresAt: o.expiresAt?.toISOString() ?? null,
    acceptedAt: o.acceptedAt?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
    sellerName:
      o.seller.sellerProfile?.displayName ??
      o.seller.buyerProfile?.displayName ??
      "Vendeur",
    sellerUserId: o.sellerUserId,
    buyerUserId: o.buyerUserId,
    iAmSeller: o.sellerUserId === session.user.id,
    iAmBuyer: o.buyerUserId === session.user.id,
    orderId: o.orders[0]?.id ?? null,
    orderStatus: o.orders[0]?.status ?? null,
  }));

  return NextResponse.json({ data });
}
