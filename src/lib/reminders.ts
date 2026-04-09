import { prisma } from "./prisma";
import { enqueueEmailOutbox, processEmailOutboxBatch } from "./outbox-email";
import { sendPushToUser } from "./push";

/**
 * Automated reminders cron job — called from /api/cron/reminders.
 * Handles: abandoned orders, unread messages, missing reviews.
 */

const ONE_DAY_MS = 86400_000;
const TWO_DAYS_MS = 2 * ONE_DAY_MS;
const THREE_DAYS_MS = 3 * ONE_DAY_MS;

async function notifyAndPush(userId: string, title: string, body: string, link: string) {
  await prisma.notification.create({
    data: { userId, channel: "in_app", title, body, dataJson: { link } },
  });
  sendPushToUser(userId, { title, body, url: link }).catch(() => {});
}

export async function processReminders(): Promise<{
  abandonedOrders: number;
  unreadMessages: number;
  missingReviews: number;
}> {
  const now = new Date();
  let abandonedOrders = 0;
  let unreadMessages = 0;
  let missingReviews = 0;

  // 1. Abandoned orders (PENDING_PAYMENT > 24h)
  const abandoned = await prisma.order.findMany({
    where: {
      status: "PENDING_PAYMENT",
      createdAt: { lt: new Date(now.getTime() - ONE_DAY_MS) },
    },
    select: {
      id: true,
      buyerUserId: true,
      service: { select: { title: true } },
      buyer: { select: { email: true, locale: true } },
    },
    take: 50,
  });

  for (const order of abandoned) {
    const isEn = order.buyer.locale === "en";
    const title = isEn
      ? "Complete your order"
      : "Finalisez votre commande";
    const body = isEn
      ? `Your order for "${order.service.title}" is awaiting payment.`
      : `Votre commande pour "${order.service.title}" est en attente de paiement.`;
    const link = `/tableau-de-bord/client/commandes/${order.id}`;

    await notifyAndPush(order.buyerUserId, title, body, link);

    if (order.buyer.email) {
      await enqueueEmailOutbox("order_created_buyer", {
        to: order.buyer.email,
        data: { orderId: order.id, serviceTitle: order.service.title, total: "—" },
      });
    }
    abandonedOrders++;
  }

  // 2. Unread messages (conversations with unread messages > 48h)
  const staleParticipants = await prisma.conversationParticipant.findMany({
    where: {
      OR: [
        { lastReadAt: null },
        { lastReadAt: { lt: new Date(now.getTime() - TWO_DAYS_MS) } },
      ],
      conversation: {
        messages: {
          some: {
            createdAt: { gt: new Date(now.getTime() - THREE_DAYS_MS) },
          },
        },
      },
    },
    select: {
      userId: true,
      conversationId: true,
      conversation: {
        select: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { authorId: true, body: true, createdAt: true },
          },
        },
      },
    },
    take: 50,
  });

  for (const cp of staleParticipants) {
    const lastMsg = cp.conversation.messages[0];
    if (!lastMsg || lastMsg.authorId === cp.userId) continue;

    const title = "Messages non lus";
    const body = `Vous avez des messages non lus. N'oubliez pas de répondre !`;
    const link = `/tableau-de-bord/client/messages/${cp.conversationId}`;

    await notifyAndPush(cp.userId, title, body, link);
    unreadMessages++;
  }

  // 3. Missing reviews (completed orders > 3 days, no review)
  const needReview = await prisma.order.findMany({
    where: {
      status: "COMPLETED",
      completedAt: {
        lt: new Date(now.getTime() - THREE_DAYS_MS),
        gt: new Date(now.getTime() - 7 * ONE_DAY_MS),
      },
      reviews: { none: {} },
    },
    select: {
      id: true,
      buyerUserId: true,
      service: { select: { title: true } },
    },
    take: 50,
  });

  for (const order of needReview) {
    const title = "Laissez un avis";
    const body = `Comment s'est passée votre expérience avec "${order.service.title}" ? Votre avis aide la communauté.`;
    const link = `/tableau-de-bord/client/commandes/${order.id}`;

    await notifyAndPush(order.buyerUserId, title, body, link);
    missingReviews++;
  }

  // Process queued emails
  if (abandonedOrders > 0) {
    await processEmailOutboxBatch(50);
  }

  return { abandonedOrders, unreadMessages, missingReviews };
}
