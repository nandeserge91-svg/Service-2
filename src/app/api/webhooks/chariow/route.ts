import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWebhookPayload } from "@/lib/chariow";
import { confirmPayment, failPayment } from "@/lib/payment-actions";

/**
 * Chariow Pulse webhook handler.
 *
 * Events handled:
 * - successful.sale → confirm payment + escrow hold
 * - failed.sale → mark payment failed
 * - abandoned.sale → mark payment failed
 *
 * Must respond 2xx quickly — heavy processing is already async-safe.
 */
export async function POST(request: NextRequest) {
  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const signature = request.headers.get("x-chariow-signature");
  if (!validateWebhookPayload(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event as string;
  const saleData = (payload.data ?? {}) as Record<string, unknown>;
  const saleId = saleData.id as string | undefined;
  const metadata = (saleData.custom_metadata ?? {}) as Record<string, string>;
  const paymentId = metadata.internal_payment_id;

  if (!paymentId) {
    return NextResponse.json({ ok: true, skipped: "no payment_id in metadata" });
  }

  // Idempotency: check if already processed
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    return NextResponse.json({ ok: true, skipped: "payment not found" });
  }
  if (payment.status === "SUCCEEDED" || payment.status === "FAILED") {
    return NextResponse.json({ ok: true, skipped: "already processed" });
  }

  // Update chariowSaleId if not yet set
  if (saleId && !payment.chariowSaleId) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { chariowSaleId: saleId },
    });
  }

  switch (event) {
    case "successful.sale":
      await confirmPayment(paymentId);
      break;

    case "failed.sale":
    case "abandoned.sale":
      await failPayment(paymentId);
      break;

    default:
      break;
  }

  return NextResponse.json({ ok: true, event });
}
