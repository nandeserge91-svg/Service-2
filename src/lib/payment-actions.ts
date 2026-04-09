"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { createCheckoutSession } from "./chariow";
import { holdEscrow } from "./escrow";
import * as notif from "./notifications";

/**
 * Initiate payment for an order.
 * Creates a Payment record, gets a Chariow checkout URL (or simulation URL),
 * then redirects the buyer.
 */
export async function initiatePayment(orderId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/connexion");

  const order = await prisma.order.findFirst({
    where: { id: orderId, buyerUserId: session.user.id },
    include: { buyer: { select: { email: true } } },
  });

  if (!order) redirect("/tableau-de-bord/client/commandes");
  if (order.status !== "PENDING_PAYMENT") {
    redirect(`/tableau-de-bord/client/commandes/${orderId}`);
  }

  const existingPayment = await prisma.payment.findFirst({
    where: { orderId, status: { in: ["PENDING", "REQUIRES_ACTION"] } },
  });
  if (existingPayment) {
    redirect(`/tableau-de-bord/client/commandes/${orderId}`);
  }

  const idempotencyKey = `order_${orderId}_${randomUUID().slice(0, 8)}`;

  const payment = await prisma.payment.create({
    data: {
      orderId,
      kind: "FULL",
      status: "PENDING",
      amountMinor: order.totalMinor,
      currency: order.currency,
      idempotencyKey,
    },
  });

  const checkout = await createCheckoutSession({
    paymentId: payment.id,
    orderId: order.id,
    buyerId: session.user.id,
    buyerEmail: order.buyer.email,
    amountMinor: order.totalMinor,
    currency: order.currency,
  });

  if (checkout.chariowSaleId) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { chariowSaleId: checkout.chariowSaleId },
    });
  }

  redirect(checkout.checkoutUrl);
}

/**
 * Process a confirmed payment (called by webhook or simulation).
 * Idempotent — safe to call multiple times for the same payment.
 */
export async function confirmPayment(paymentId: string): Promise<boolean> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: { include: { service: { select: { title: true } } } } },
  });

  if (!payment) return false;
  if (payment.status === "SUCCEEDED") return true;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "SUCCEEDED", succeededAt: new Date() },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "IN_PROGRESS" },
    }),
    prisma.orderEvent.createMany({
      data: [
        {
          orderId: payment.orderId,
          status: "PAID",
          note: `Paiement de ${payment.amountMinor} ${payment.currency} confirmé`,
        },
        {
          orderId: payment.orderId,
          status: "IN_PROGRESS",
          note: "Le vendeur peut commencer le travail",
        },
      ],
    }),
  ]);

  await holdEscrow(payment.orderId);

  notif.onPaymentConfirmed({
    id: payment.orderId,
    buyerUserId: payment.order.buyerUserId,
    sellerUserId: payment.order.sellerUserId,
    serviceTitle: payment.order.service.title,
  }).catch(() => {});

  return true;
}

/**
 * Mark a payment as failed.
 */
export async function failPayment(paymentId: string): Promise<void> {
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "FAILED" },
  });
}
