import { prisma } from "./prisma";
import { deferAfterResponse } from "./deferred";
import { enqueueEmailOutbox, processEmailOutboxBatch } from "./outbox-email";
import { sendPushToUser } from "./push";
import { formatPrice } from "./utils";

type Channel = "in_app" | "email" | "both";

interface NotifyOpts {
  userId: string;
  title: string;
  body: string;
  channel?: Channel;
  data?: Record<string, string>;
}

/**
 * Create an in-app notification, send a push notification, and optionally dispatch an email.
 * All calls are fire-and-forget — errors are logged, never thrown.
 */
async function notify({ userId, title, body, channel = "both", data }: NotifyOpts) {
  try {
    if (channel === "in_app" || channel === "both") {
      await prisma.notification.create({
        data: {
          userId,
          channel: "in_app",
          title,
          body,
          dataJson: data ?? undefined,
        },
      });
    }
  } catch (err) {
    console.error("[notify:in_app]", err);
  }

  try {
    sendPushToUser(userId, {
      title,
      body,
      url: data?.link,
      tag: data?.orderId ?? data?.conversationId ?? undefined,
    }).catch((err) => console.error("[notify:push]", err));
  } catch {
    /* push unavailable */
  }
}

async function getUserEmail(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return user?.email ?? null;
}

async function getUserName(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sellerProfile: { select: { displayName: true } }, buyerProfile: { select: { displayName: true } } },
  });
  return user?.sellerProfile?.displayName ?? user?.buyerProfile?.displayName ?? "Utilisateur";
}

// ——— Event-specific dispatchers ———

export async function onOrderCreated(order: {
  id: string;
  buyerUserId: string;
  sellerUserId: string;
  serviceTitle: string;
  totalMinor: bigint;
  currency: string;
}) {
  const total = formatPrice(order.totalMinor, order.currency);
  const buyerName = await getUserName(order.buyerUserId);

  await notify({
    userId: order.buyerUserId,
    title: "Commande créée",
    body: `Votre commande pour "${order.serviceTitle}" est en attente de paiement.`,
    data: { orderId: order.id, link: `/tableau-de-bord/client/commandes/${order.id}` },
  });

  await notify({
    userId: order.sellerUserId,
    title: "Nouvelle commande reçue",
    body: `${buyerName} a commandé "${order.serviceTitle}".`,
    data: { orderId: order.id, link: `/tableau-de-bord/vendeur/commandes/${order.id}` },
  });

  const buyerEmail = await getUserEmail(order.buyerUserId);
  const sellerEmail = await getUserEmail(order.sellerUserId);
  if (buyerEmail) {
    await enqueueEmailOutbox("order_created_buyer", {
      to: buyerEmail,
      data: { orderId: order.id, serviceTitle: order.serviceTitle, total },
    });
  }
  if (sellerEmail) {
    await enqueueEmailOutbox("order_created_seller", {
      to: sellerEmail,
      data: { orderId: order.id, serviceTitle: order.serviceTitle, buyerName },
    });
  }
  if (buyerEmail || sellerEmail) {
    deferAfterResponse(() => void processEmailOutboxBatch(25));
  }
}

export async function onPaymentConfirmed(order: {
  id: string;
  buyerUserId: string;
  sellerUserId: string;
  serviceTitle: string;
}) {
  const buyerName = await getUserName(order.buyerUserId);

  await notify({
    userId: order.buyerUserId,
    title: "Paiement confirmé",
    body: `Votre paiement pour "${order.serviceTitle}" a été reçu. Le vendeur peut commencer.`,
    data: { orderId: order.id, link: `/tableau-de-bord/client/commandes/${order.id}` },
  });

  await notify({
    userId: order.sellerUserId,
    title: "Paiement reçu — commencez !",
    body: `${buyerName} a payé pour "${order.serviceTitle}". Vous pouvez travailler.`,
    data: { orderId: order.id, link: `/tableau-de-bord/vendeur/commandes/${order.id}` },
  });

  const buyerEmail = await getUserEmail(order.buyerUserId);
  const sellerEmail = await getUserEmail(order.sellerUserId);
  if (buyerEmail) {
    await enqueueEmailOutbox("payment_confirmed_buyer", {
      to: buyerEmail,
      data: { orderId: order.id, serviceTitle: order.serviceTitle },
    });
  }
  if (sellerEmail) {
    await enqueueEmailOutbox("payment_confirmed_seller", {
      to: sellerEmail,
      data: { orderId: order.id, serviceTitle: order.serviceTitle, buyerName },
    });
  }
  if (buyerEmail || sellerEmail) {
    deferAfterResponse(() => void processEmailOutboxBatch(25));
  }
}

export async function onOrderDelivered(order: {
  id: string;
  buyerUserId: string;
  sellerUserId: string;
  serviceTitle: string;
}) {
  const sellerName = await getUserName(order.sellerUserId);

  await notify({
    userId: order.buyerUserId,
    title: "Commande livrée",
    body: `${sellerName} a livré "${order.serviceTitle}". Vérifiez et validez.`,
    data: { orderId: order.id, link: `/tableau-de-bord/client/commandes/${order.id}` },
  });

  const buyerEmail = await getUserEmail(order.buyerUserId);
  if (buyerEmail) {
    await enqueueEmailOutbox("order_delivered", {
      to: buyerEmail,
      data: { orderId: order.id, serviceTitle: order.serviceTitle, sellerName },
    });
    deferAfterResponse(() => void processEmailOutboxBatch(25));
  }
}

export async function onOrderCompleted(order: {
  id: string;
  sellerUserId: string;
  serviceTitle: string;
  subtotalMinor: bigint;
  platformFeeMinor: bigint;
  currency: string;
}) {
  const net = formatPrice(order.subtotalMinor - order.platformFeeMinor, order.currency);

  await notify({
    userId: order.sellerUserId,
    title: "Commande terminée — fonds libérés",
    body: `"${order.serviceTitle}" est terminée. ${net} crédité sur votre portefeuille.`,
    data: { orderId: order.id, link: `/tableau-de-bord/vendeur/revenus` },
  });

  const sellerEmail = await getUserEmail(order.sellerUserId);
  if (sellerEmail) {
    await enqueueEmailOutbox("order_completed", {
      to: sellerEmail,
      data: { orderId: order.id, serviceTitle: order.serviceTitle, netAmount: net },
    });
    deferAfterResponse(() => void processEmailOutboxBatch(25));
  }
}

export async function onRevisionRequested(order: {
  id: string;
  sellerUserId: string;
  serviceTitle: string;
  reason: string;
}) {
  await notify({
    userId: order.sellerUserId,
    title: "Révision demandée",
    body: `Le client demande une révision pour "${order.serviceTitle}".`,
    data: { orderId: order.id, link: `/tableau-de-bord/vendeur/commandes/${order.id}` },
  });

  const sellerEmail = await getUserEmail(order.sellerUserId);
  if (sellerEmail) {
    await enqueueEmailOutbox("revision_requested", {
      to: sellerEmail,
      data: { orderId: order.id, serviceTitle: order.serviceTitle, reason: order.reason },
    });
    deferAfterResponse(() => void processEmailOutboxBatch(25));
  }
}

export async function onNewMessage(data: {
  conversationId: string;
  recipientUserId: string;
  senderUserId: string;
  preview: string;
  recipientRole: "client" | "vendeur";
}) {
  const senderName = await getUserName(data.senderUserId);

  await notify({
    userId: data.recipientUserId,
    title: `Message de ${senderName}`,
    body: data.preview.slice(0, 120) + (data.preview.length > 120 ? "…" : ""),
    data: { conversationId: data.conversationId, link: `/tableau-de-bord/${data.recipientRole}/messages/${data.conversationId}` },
  });

  const recipientEmail = await getUserEmail(data.recipientUserId);
  if (recipientEmail) {
    await enqueueEmailOutbox("new_message", {
      to: recipientEmail,
      data: {
        conversationId: data.conversationId,
        senderName,
        preview: data.preview,
        role: data.recipientRole,
      },
    });
    deferAfterResponse(() => void processEmailOutboxBatch(25));
  }
}

export async function onOfferReceived(data: {
  conversationId: string;
  buyerUserId: string;
  sellerUserId: string;
  offerTitle: string;
  amountMinor: bigint;
  currency: string;
}) {
  const sellerName = await getUserName(data.sellerUserId);
  const amount = formatPrice(data.amountMinor, data.currency);

  await notify({
    userId: data.buyerUserId,
    title: "Offre personnalisée reçue",
    body: `${sellerName} vous propose "${data.offerTitle}" pour ${amount}.`,
    data: { conversationId: data.conversationId, link: `/tableau-de-bord/client/messages/${data.conversationId}` },
  });

  const buyerEmail = await getUserEmail(data.buyerUserId);
  if (buyerEmail) {
    await enqueueEmailOutbox("offer_received", {
      to: buyerEmail,
      data: {
        conversationId: data.conversationId,
        sellerName,
        offerTitle: data.offerTitle,
        amount,
      },
    });
    deferAfterResponse(() => void processEmailOutboxBatch(25));
  }
}

export async function onOrderCancelled(order: {
  id: string;
  sellerUserId: string;
  buyerUserId: string;
  serviceTitle: string;
}) {
  await notify({
    userId: order.sellerUserId,
    title: "Commande annulée",
    body: `La commande pour "${order.serviceTitle}" a été annulée par le client.`,
    data: { orderId: order.id, link: `/tableau-de-bord/vendeur/commandes/${order.id}` },
  });
}

export async function onReviewReceived(data: {
  orderId: string;
  sellerUserId: string;
  serviceTitle: string;
  rating: number;
}) {
  const stars = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);
  await notify({
    userId: data.sellerUserId,
    title: "Nouvel avis reçu",
    body: `${stars} pour "${data.serviceTitle}". Consultez et répondez.`,
    data: { orderId: data.orderId, link: `/tableau-de-bord/vendeur/commandes/${data.orderId}` },
  });
}

export async function onDisputeOpened(data: {
  disputeId: string;
  orderId: string;
  sellerUserId: string;
  buyerUserId: string;
  serviceTitle: string;
}) {
  await notify({
    userId: data.sellerUserId,
    title: "Litige ouvert",
    body: `Un litige a été ouvert pour "${data.serviceTitle}". Les fonds sont gelés.`,
    data: { disputeId: data.disputeId, link: `/tableau-de-bord/vendeur/commandes/${data.orderId}` },
  });

  await notify({
    userId: data.buyerUserId,
    title: "Litige enregistré",
    body: `Votre litige pour "${data.serviceTitle}" a été enregistré. L'équipe support va l'examiner.`,
    data: { disputeId: data.disputeId, link: `/tableau-de-bord/client/commandes/${data.orderId}` },
  });
}

export async function onDisputeResolved(data: {
  disputeId: string;
  orderId: string;
  sellerUserId: string;
  buyerUserId: string;
  serviceTitle: string;
  resolutionLabel: string;
}) {
  await notify({
    userId: data.buyerUserId,
    title: "Litige résolu",
    body: `Le litige pour "${data.serviceTitle}" a été résolu : ${data.resolutionLabel}.`,
    data: { disputeId: data.disputeId, link: `/tableau-de-bord/client/commandes/${data.orderId}` },
  });

  await notify({
    userId: data.sellerUserId,
    title: "Litige résolu",
    body: `Le litige pour "${data.serviceTitle}" a été résolu : ${data.resolutionLabel}.`,
    data: { disputeId: data.disputeId, link: `/tableau-de-bord/vendeur/commandes/${data.orderId}` },
  });
}
