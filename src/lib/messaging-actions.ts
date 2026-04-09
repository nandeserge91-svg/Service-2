"use server";

import { redirect } from "next/navigation";
import { auth } from "./auth";
import { prisma } from "./prisma";
import * as notif from "./notifications";

interface ActionResult {
  success?: boolean;
  error?: string;
  conversationId?: string;
}

/**
 * Find existing DIRECT conversation between two users (optionally about a service),
 * or create a new one.
 */
export async function getOrCreateConversation(
  otherUserId: string,
  serviceId?: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };
  if (session.user.id === otherUserId) return { error: "Vous ne pouvez pas vous écrire à vous-même." };

  const existing = await prisma.conversation.findFirst({
    where: {
      type: "DIRECT",
      ...(serviceId ? { serviceId } : {}),
      AND: [
        { participants: { some: { userId: session.user.id } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
    select: { id: true },
  });

  if (existing) return { success: true, conversationId: existing.id };

  const conversation = await prisma.conversation.create({
    data: {
      type: "DIRECT",
      serviceId: serviceId ?? null,
      participants: {
        createMany: {
          data: [{ userId: session.user.id }, { userId: otherUserId }],
        },
      },
      messages: {
        create: {
          authorId: session.user.id,
          body: null,
          isSystem: true,
        },
      },
    },
  });

  return { success: true, conversationId: conversation.id };
}

/**
 * Start a conversation from service detail page, then redirect to messages.
 */
export async function contactSeller(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/connexion");

  const sellerUserId = formData.get("sellerUserId") as string;
  const serviceId = formData.get("serviceId") as string;
  const dashboardBase = (session.user.roles ?? []).includes("SELLER")
    ? "/tableau-de-bord/vendeur"
    : "/tableau-de-bord/client";

  const result = await getOrCreateConversation(sellerUserId, serviceId);

  if (result.conversationId) {
    redirect(`${dashboardBase}/messages/${result.conversationId}`);
  }

  redirect(dashboardBase + "/messages");
}

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: session.user.id },
    },
  });
  if (!participant) return { error: "Vous ne faites pas partie de cette conversation." };

  const trimmed = body.trim();
  if (!trimmed) return { error: "Le message ne peut pas être vide." };

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, authorId: session.user.id, body: trimmed },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
    prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId: session.user.id },
      },
      data: { lastReadAt: new Date() },
    }),
  ]);

  const recipients = participants.filter((p) => p.userId !== session.user.id);
  for (const r of recipients) {
    const roles = await prisma.userRoleAssignment.findMany({
      where: { userId: r.userId },
      select: { role: true },
    });
    const isSeller = roles.some((ra) => ra.role === "SELLER");
    notif.onNewMessage({
      conversationId,
      recipientUserId: r.userId,
      senderUserId: session.user.id,
      preview: trimmed,
      recipientRole: isSeller ? "vendeur" : "client",
    }).catch(() => {});
  }

  return { success: true };
}

export async function markConversationRead(
  conversationId: string,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId: session.user.id },
    data: { lastReadAt: new Date() },
  });
}
