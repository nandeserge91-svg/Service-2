"use server";

import { auth } from "./auth";
import { prisma } from "./prisma";
import * as notif from "./notifications";

interface ActionResult {
  success?: boolean;
  error?: string;
  offerId?: string;
  orderId?: string;
}

export async function createOffer(
  conversationId: string,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: { some: { userId: session.user.id } },
    },
    include: {
      participants: true,
      service: { select: { id: true } },
    },
  });
  if (!conversation) return { error: "Conversation introuvable." };
  if (!conversation.service) {
    return { error: "Cette conversation n'est pas liée à un service. Impossible de créer une offre." };
  }

  const buyerParticipant = conversation.participants.find(
    (p) => p.userId !== session.user.id,
  );
  if (!buyerParticipant) return { error: "Pas de destinataire dans cette conversation." };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const amount = parseInt(formData.get("amount") as string, 10);
  const deliveryDays = parseInt(formData.get("deliveryDays") as string, 10);
  const revisions = parseInt(formData.get("revisions") as string, 10) || 0;
  const expiresInDays = parseInt(formData.get("expiresInDays") as string, 10) || 7;

  if (!title || isNaN(amount) || isNaN(deliveryDays)) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }
  if (amount < 500) return { error: "Le montant minimum est de 500 FCFA." };
  if (deliveryDays < 1) return { error: "Le délai minimum est de 1 jour." };

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const [offer] = await prisma.$transaction([
    prisma.offer.create({
      data: {
        conversationId,
        sellerUserId: session.user.id,
        buyerUserId: buyerParticipant.userId,
        status: "SENT",
        title,
        description,
        amountMinor: BigInt(amount),
        currency: "XOF",
        deliveryDays,
        revisions,
        expiresAt,
      },
    }),
    prisma.message.create({
      data: {
        conversationId,
        authorId: session.user.id,
        body: `📋 Offre envoyée : ${title} — ${amount.toLocaleString("fr-FR")} FCFA`,
        isSystem: true,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  notif.onOfferReceived({
    conversationId,
    buyerUserId: buyerParticipant.userId,
    sellerUserId: session.user.id,
    offerTitle: title,
    amountMinor: BigInt(amount),
    currency: "XOF",
  }).catch(() => {});

  return { success: true, offerId: offer.id };
}

export async function respondToOffer(
  offerId: string,
  action: "accept" | "reject",
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      conversation: {
        include: { service: { select: { id: true, title: true } } },
      },
    },
  });

  if (!offer) return { error: "Offre introuvable." };
  if (offer.buyerUserId !== session.user.id) {
    return { error: "Vous n'êtes pas le destinataire de cette offre." };
  }
  if (offer.status !== "SENT") {
    return { error: "Cette offre n'est plus en attente." };
  }
  if (offer.expiresAt && offer.expiresAt < new Date()) {
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: "EXPIRED" },
    });
    return { error: "Cette offre a expiré." };
  }

  if (action === "reject") {
    await prisma.$transaction([
      prisma.offer.update({
        where: { id: offerId },
        data: { status: "REJECTED" },
      }),
      prisma.message.create({
        data: {
          conversationId: offer.conversationId,
          authorId: session.user.id,
          body: `❌ Offre refusée : ${offer.title}`,
          isSystem: true,
        },
      }),
    ]);
    return { success: true };
  }

  // Accept flow — create Order
  const serviceId = offer.conversation.service?.id;
  if (!serviceId) {
    return { error: "Service introuvable pour cette offre." };
  }

  const rule = await prisma.commissionRule.findFirst({
    orderBy: { effectiveFrom: "desc" },
  });
  const feeBps = rule?.percentBps ?? 1000; // 10% default
  const subtotal = offer.amountMinor;
  const fee = (subtotal * BigInt(feeBps)) / BigInt(10000);
  const total = subtotal + fee;

  const deliveryDueAt = new Date();
  if (offer.deliveryDays) {
    deliveryDueAt.setDate(deliveryDueAt.getDate() + offer.deliveryDays);
  }

  const [, , order] = await prisma.$transaction([
    prisma.offer.update({
      where: { id: offerId },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    }),
    prisma.message.create({
      data: {
        conversationId: offer.conversationId,
        authorId: session.user.id,
        body: `✅ Offre acceptée : ${offer.title} — En attente de paiement`,
        isSystem: true,
      },
    }),
    prisma.order.create({
      data: {
        buyerUserId: offer.buyerUserId,
        sellerUserId: offer.sellerUserId,
        serviceId,
        offerId: offer.id,
        status: "PENDING_PAYMENT",
        currency: offer.currency,
        subtotalMinor: subtotal,
        platformFeeMinor: fee,
        totalMinor: total,
        deliveryDueAt,
        conversation: {
          create: {
            type: "ORDER_THREAD",
            serviceId,
            participants: {
              createMany: {
                data: [
                  { userId: offer.buyerUserId },
                  { userId: offer.sellerUserId },
                ],
              },
            },
          },
        },
      },
    }),
    prisma.conversation.update({
      where: { id: offer.conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return { success: true, orderId: order.id };
}
