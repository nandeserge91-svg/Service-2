"use server";

import { auth } from "./auth";
import { prisma } from "./prisma";
import { freezeEscrow, refundEscrow, releaseEscrow } from "./escrow";
import * as audit from "./audit";
import * as notif from "./notifications";

interface ActionResult {
  success?: boolean;
  error?: string;
  disputeId?: string;
}

const DISPUTABLE_STATUSES = ["IN_PROGRESS", "DELIVERED", "REVISION_REQUESTED"];

/**
 * Open a dispute on an order (buyer only).
 */
export async function openDispute(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const orderId = formData.get("orderId") as string;
  const reason = (formData.get("reason") as string)?.trim();

  if (!orderId) return { error: "Commande manquante." };
  if (!reason || reason.length < 20) {
    return { error: "Veuillez décrire le problème (min. 20 caractères)." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      service: { select: { title: true } },
      disputes: { where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } },
    },
  });

  if (!order) return { error: "Commande introuvable." };
  if (order.buyerUserId !== session.user.id) return { error: "Seul l'acheteur peut ouvrir un litige." };
  if (!DISPUTABLE_STATUSES.includes(order.status)) {
    return { error: "Impossible d'ouvrir un litige sur cette commande dans son état actuel." };
  }
  if (order.disputes.length > 0) {
    return { error: "Un litige est déjà en cours pour cette commande." };
  }

  const [dispute] = await prisma.$transaction([
    prisma.dispute.create({
      data: {
        orderId,
        openedById: session.user.id,
        status: "OPEN",
        reason,
        messages: {
          create: {
            authorId: session.user.id,
            body: reason,
            isSystem: false,
          },
        },
      },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: "DISPUTED" },
    }),
    prisma.orderEvent.create({
      data: {
        orderId,
        status: "DISPUTED",
        note: "Litige ouvert par le client",
        actorId: session.user.id,
      },
    }),
  ]);

  // Freeze escrow
  try {
    await freezeEscrow(orderId);
  } catch {
    // non-blocking
  }

  audit.log({
    actorId: session.user.id,
    action: "DISPUTE_OPENED",
    entity: "Dispute",
    entityId: dispute.id,
    payload: { orderId, reason: reason.slice(0, 200) },
  });

  notif.onDisputeOpened({
    disputeId: dispute.id,
    orderId,
    sellerUserId: order.sellerUserId,
    buyerUserId: order.buyerUserId,
    serviceTitle: order.service.title,
  }).catch(() => {});

  return { success: true, disputeId: dispute.id };
}

/**
 * Add a message to a dispute thread (buyer, seller, or support).
 */
export async function addDisputeMessage(
  disputeId: string,
  body: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const trimmed = body.trim();
  if (!trimmed) return { error: "Le message ne peut pas être vide." };

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { order: { select: { buyerUserId: true, sellerUserId: true } } },
  });

  if (!dispute) return { error: "Litige introuvable." };
  if (dispute.status === "CLOSED" || dispute.status === "RESOLVED") {
    return { error: "Ce litige est clos." };
  }

  const roles = session.user.roles ?? [];
  const isParty =
    dispute.order.buyerUserId === session.user.id ||
    dispute.order.sellerUserId === session.user.id;
  const isStaff = roles.includes("SUPPORT") || roles.includes("ADMIN");

  if (!isParty && !isStaff) return { error: "Accès refusé." };

  await prisma.disputeMessage.create({
    data: { disputeId, authorId: session.user.id, body: trimmed },
  });

  return { success: true };
}

/**
 * Take a dispute under review (support/admin).
 */
export async function takeDisputeUnderReview(disputeId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const roles = session.user.roles ?? [];
  if (!roles.includes("SUPPORT") && !roles.includes("ADMIN")) {
    return { error: "Accès refusé." };
  }

  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) return { error: "Litige introuvable." };
  if (dispute.status !== "OPEN") return { error: "Ce litige n'est pas en attente." };

  await prisma.$transaction([
    prisma.dispute.update({
      where: { id: disputeId },
      data: { status: "UNDER_REVIEW", assignedToId: session.user.id },
    }),
    prisma.disputeMessage.create({
      data: {
        disputeId,
        authorId: session.user.id,
        body: "Le litige est pris en charge par l'équipe support.",
        isSystem: true,
      },
    }),
  ]);

  return { success: true };
}

/**
 * Resolve a dispute (support/admin).
 * Resolution types: REFUND_BUYER, RELEASE_SELLER, PARTIAL_REFUND.
 */
export async function resolveDispute(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const roles = session.user.roles ?? [];
  if (!roles.includes("SUPPORT") && !roles.includes("ADMIN")) {
    return { error: "Accès refusé." };
  }

  const disputeId = formData.get("disputeId") as string;
  const resolutionType = formData.get("resolutionType") as string;
  const note = (formData.get("note") as string)?.trim() || null;

  if (!["REFUND_BUYER", "RELEASE_SELLER", "PARTIAL_REFUND"].includes(resolutionType)) {
    return { error: "Type de résolution invalide." };
  }

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      order: { include: { service: { select: { title: true } } } },
    },
  });

  if (!dispute) return { error: "Litige introuvable." };
  if (dispute.status === "RESOLVED" || dispute.status === "CLOSED") {
    return { error: "Ce litige est déjà résolu." };
  }

  const order = dispute.order;
  const resolutionLabel =
    resolutionType === "REFUND_BUYER"
      ? "Remboursement intégral au client"
      : resolutionType === "RELEASE_SELLER"
        ? "Libération des fonds au vendeur"
        : "Remboursement partiel";

  await prisma.$transaction([
    prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: "RESOLVED",
        resolutionType: resolutionType as "REFUND_BUYER" | "RELEASE_SELLER" | "PARTIAL_REFUND",
        resolutionNote: note,
        resolvedAt: new Date(),
      },
    }),
    prisma.disputeMessage.create({
      data: {
        disputeId,
        authorId: session.user.id,
        body: `Résolution : ${resolutionLabel}${note ? ` — ${note}` : ""}`,
        isSystem: true,
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: resolutionType === "RELEASE_SELLER" ? "COMPLETED" : "CANCELLED",
        ...(resolutionType === "RELEASE_SELLER"
          ? { completedAt: new Date() }
          : { cancelledAt: new Date() }),
      },
    }),
    prisma.orderEvent.create({
      data: {
        orderId: order.id,
        status: resolutionType === "RELEASE_SELLER" ? "COMPLETED" : "CANCELLED",
        note: `Litige résolu : ${resolutionLabel}`,
        actorId: session.user.id,
      },
    }),
  ]);

  // Escrow action based on resolution
  try {
    if (resolutionType === "REFUND_BUYER" || resolutionType === "PARTIAL_REFUND") {
      await refundEscrow(order.id);
    } else {
      await releaseEscrow(order.id);
    }
  } catch {
    // non-blocking — logged for reconciliation
  }

  audit.log({
    actorId: session.user.id,
    action: "DISPUTE_RESOLVED",
    entity: "Dispute",
    entityId: disputeId,
    payload: { orderId: order.id, resolutionType, note },
  });

  notif.onDisputeResolved({
    disputeId,
    orderId: order.id,
    sellerUserId: order.sellerUserId,
    buyerUserId: order.buyerUserId,
    serviceTitle: order.service.title,
    resolutionLabel,
  }).catch(() => {});

  return { success: true };
}
