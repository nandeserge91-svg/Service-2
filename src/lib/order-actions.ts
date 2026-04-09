"use server";

import { redirect } from "next/navigation";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { releaseEscrow } from "./escrow";
import * as notif from "./notifications";
import { validateCoupon, incrementCouponUsage } from "./coupon-actions";

interface ActionResult {
  success?: boolean;
  error?: string;
  orderId?: string;
}

// ——— Create order from a catalogue package ———

export async function createOrderFromPackage(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/connexion");

  const packageId = formData.get("packageId") as string;
  const brief = (formData.get("brief") as string)?.trim() || null;

  const pkg = await prisma.servicePackage.findUnique({
    where: { id: packageId },
    include: {
      service: {
        include: { sellerProfile: { select: { userId: true } } },
      },
    },
  });

  if (!pkg || pkg.service.status !== "PUBLISHED") {
    redirect("/services");
  }

  const sellerUserId = pkg.service.sellerProfile.userId;
  if (sellerUserId === session.user.id) {
    redirect(`/services/${pkg.service.slug}`);
  }

  const rule = await prisma.commissionRule.findFirst({
    orderBy: { effectiveFrom: "desc" },
  });
  const feeBps = rule?.percentBps ?? 1000;
  const subtotal = pkg.priceMinor;

  const couponCode = (formData.get("couponCode") as string)?.trim() || "";
  let discountMinor = BigInt(0);
  let couponId: string | null = null;

  if (couponCode) {
    const cv = await validateCoupon(couponCode, subtotal, pkg.currency);
    if (cv.valid) {
      discountMinor = cv.discountMinor;
      couponId = cv.couponId;
    }
  }

  const afterDiscount = subtotal - discountMinor;
  const fee = (afterDiscount * BigInt(feeBps)) / BigInt(10000);
  const total = afterDiscount + fee;

  const deliveryDueAt = new Date();
  deliveryDueAt.setDate(deliveryDueAt.getDate() + pkg.deliveryDays);

  const order = await prisma.order.create({
    data: {
      buyerUserId: session.user.id,
      sellerUserId,
      serviceId: pkg.serviceId,
      servicePackageId: pkg.id,
      couponId,
      status: "PENDING_PAYMENT",
      currency: pkg.currency,
      subtotalMinor: subtotal,
      discountMinor,
      platformFeeMinor: fee,
      totalMinor: total,
      brief,
      deliveryDueAt,
      events: {
        create: {
          status: "PENDING_PAYMENT",
          note: `Commande créée — ${pkg.title}${couponCode ? ` (coupon ${couponCode})` : ""}`,
          actorId: session.user.id,
        },
      },
    },
  });

  if (couponId) {
    incrementCouponUsage(couponId).catch(() => {});
  }

  notif.onOrderCreated({
    id: order.id,
    buyerUserId: session.user.id,
    sellerUserId,
    serviceTitle: pkg.service.title,
    totalMinor: total,
    currency: pkg.currency,
  }).catch(() => {});

  redirect(`/tableau-de-bord/client/commandes/${order.id}`);
}

// ——— Seller delivers ———

export async function deliverOrder(
  orderId: string,
  message?: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { service: { select: { title: true } } },
  });
  if (!order) return { error: "Commande introuvable." };
  if (order.sellerUserId !== session.user.id) return { error: "Accès refusé." };
  if (order.status !== "IN_PROGRESS" && order.status !== "REVISION_REQUESTED") {
    return { error: "Cette commande ne peut pas être livrée dans son état actuel." };
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: "DELIVERED" },
    }),
    prisma.orderEvent.create({
      data: {
        orderId,
        status: "DELIVERED",
        note: message?.trim() || "Livraison effectuée",
        actorId: session.user.id,
      },
    }),
  ]);

  notif.onOrderDelivered({
    id: orderId,
    buyerUserId: order.buyerUserId,
    sellerUserId: order.sellerUserId,
    serviceTitle: order.service.title,
  }).catch(() => {});

  return { success: true };
}

// ——— Client accepts delivery ———

export async function acceptDelivery(orderId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { service: { select: { title: true } } },
  });
  if (!order) return { error: "Commande introuvable." };
  if (order.buyerUserId !== session.user.id) return { error: "Accès refusé." };
  if (order.status !== "DELIVERED") return { error: "Statut invalide." };

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED", completedAt: new Date() },
    }),
    prisma.orderEvent.create({
      data: {
        orderId,
        status: "COMPLETED",
        note: "Livraison acceptée par le client",
        actorId: session.user.id,
      },
    }),
  ]);

  try {
    await releaseEscrow(orderId);
  } catch {
    // non-blocking — logged for manual reconciliation
  }

  notif.onOrderCompleted({
    id: orderId,
    sellerUserId: order.sellerUserId,
    serviceTitle: order.service.title,
    subtotalMinor: order.subtotalMinor,
    platformFeeMinor: order.platformFeeMinor,
    currency: order.currency,
  }).catch(() => {});

  return { success: true };
}

// ——— Client requests revision ———

export async function requestRevision(
  orderId: string,
  reason: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      service: { select: { title: true } },
      servicePackage: { select: { revisions: true } },
      offer: { select: { revisions: true } },
      events: { where: { status: "REVISION_REQUESTED" } },
    },
  });
  if (!order) return { error: "Commande introuvable." };
  if (order.buyerUserId !== session.user.id) return { error: "Accès refusé." };
  if (order.status !== "DELIVERED") return { error: "Statut invalide." };

  const maxRevisions = order.servicePackage?.revisions ?? order.offer?.revisions ?? 0;
  const usedRevisions = order.events.length;
  if (maxRevisions > 0 && usedRevisions >= maxRevisions) {
    return { error: `Vous avez utilisé toutes vos ${maxRevisions} révision(s) incluse(s).` };
  }

  const trimmed = reason.trim();
  if (!trimmed) return { error: "Veuillez expliquer ce que vous souhaitez modifier." };

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: "REVISION_REQUESTED" },
    }),
    prisma.orderEvent.create({
      data: {
        orderId,
        status: "REVISION_REQUESTED",
        note: trimmed,
        actorId: session.user.id,
      },
    }),
  ]);

  notif.onRevisionRequested({
    id: orderId,
    sellerUserId: order.sellerUserId,
    serviceTitle: order.service.title,
    reason: trimmed,
  }).catch(() => {});

  return { success: true };
}

// ——— Cancel order ———

export async function cancelOrder(orderId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { service: { select: { title: true } } },
  });
  if (!order) return { error: "Commande introuvable." };
  if (order.buyerUserId !== session.user.id) return { error: "Seul l'acheteur peut annuler." };
  if (order.status !== "PENDING_PAYMENT" && order.status !== "PAID") {
    return { error: "Cette commande ne peut plus être annulée. Ouvrez un litige si nécessaire." };
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    }),
    prisma.orderEvent.create({
      data: {
        orderId,
        status: "CANCELLED",
        note: "Commande annulée par le client",
        actorId: session.user.id,
      },
    }),
  ]);

  notif.onOrderCancelled({
    id: orderId,
    sellerUserId: order.sellerUserId,
    buyerUserId: order.buyerUserId,
    serviceTitle: order.service.title,
  }).catch(() => {});

  return { success: true };
}
