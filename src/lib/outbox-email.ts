import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import * as email from "@/lib/email";

const MAX_ATTEMPTS = 5;

export type EmailOutboxKind =
  | "contact"
  | "order_created_buyer"
  | "order_created_seller"
  | "payment_confirmed_buyer"
  | "payment_confirmed_seller"
  | "order_delivered"
  | "order_completed"
  | "revision_requested"
  | "new_message"
  | "offer_received";

export async function enqueueEmailOutbox(kind: EmailOutboxKind, payload: Prisma.InputJsonValue): Promise<void> {
  await prisma.emailOutbox.create({
    data: { kind, payload },
  });
}

async function dispatch(kind: string, payload: Prisma.JsonObject): Promise<void> {
  switch (kind as EmailOutboxKind) {
    case "contact": {
      const to = payload.to as string;
      const subject = payload.subject as string;
      const html = payload.html as string;
      await email.sendMail({ to, subject, html });
      return;
    }
    case "order_created_buyer":
      await email.sendOrderCreatedBuyer(payload.to as string, payload.data as Parameters<typeof email.sendOrderCreatedBuyer>[1]);
      return;
    case "order_created_seller":
      await email.sendOrderCreatedSeller(payload.to as string, payload.data as Parameters<typeof email.sendOrderCreatedSeller>[1]);
      return;
    case "payment_confirmed_buyer":
      await email.sendPaymentConfirmedBuyer(payload.to as string, payload.data as Parameters<typeof email.sendPaymentConfirmedBuyer>[1]);
      return;
    case "payment_confirmed_seller":
      await email.sendPaymentConfirmedSeller(payload.to as string, payload.data as Parameters<typeof email.sendPaymentConfirmedSeller>[1]);
      return;
    case "order_delivered":
      await email.sendOrderDelivered(payload.to as string, payload.data as Parameters<typeof email.sendOrderDelivered>[1]);
      return;
    case "order_completed":
      await email.sendOrderCompleted(payload.to as string, payload.data as Parameters<typeof email.sendOrderCompleted>[1]);
      return;
    case "revision_requested":
      await email.sendRevisionRequested(payload.to as string, payload.data as Parameters<typeof email.sendRevisionRequested>[1]);
      return;
    case "new_message":
      await email.sendNewMessage(payload.to as string, payload.data as Parameters<typeof email.sendNewMessage>[1]);
      return;
    case "offer_received":
      await email.sendOfferReceived(payload.to as string, payload.data as Parameters<typeof email.sendOfferReceived>[1]);
      return;
    default:
      throw new Error(`Unknown email outbox kind: ${kind}`);
  }
}

/**
 * Traite jusqu’à `limit` lignes PENDING. À appeler après `after()` ou via cron (`/api/cron/outbox`).
 */
export async function processEmailOutboxBatch(limit = 25): Promise<{ processed: number; errors: number }> {
  const rows = await prisma.emailOutbox.findMany({
    where: { status: "PENDING", attempts: { lt: MAX_ATTEMPTS } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  let processed = 0;
  let errors = 0;

  for (const row of rows) {
    const payload = row.payload as Prisma.JsonObject;
    try {
      await dispatch(row.kind, payload);
      await prisma.emailOutbox.update({
        where: { id: row.id },
        data: { status: "SENT", processedAt: new Date(), lastError: null },
      });
      processed += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const attempts = row.attempts + 1;
      await prisma.emailOutbox.update({
        where: { id: row.id },
        data: {
          attempts,
          lastError: msg.slice(0, 4000),
          status: attempts >= MAX_ATTEMPTS ? "FAILED" : "PENDING",
          processedAt: attempts >= MAX_ATTEMPTS ? new Date() : undefined,
        },
      });
      errors += 1;
    }
  }

  return { processed, errors };
}
