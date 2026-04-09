import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmPayment, failPayment } from "@/lib/payment-actions";

/**
 * Orange Money webhook handler.
 * Receives payment status notifications from Orange Money API.
 */
export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const status = payload.status as string;
  const reference = payload.reference as string | undefined;
  const payToken = payload.pay_token as string | undefined;

  if (!reference) {
    return NextResponse.json({ ok: true, skipped: "no reference" });
  }

  const payment = await prisma.payment.findUnique({ where: { id: reference } });
  if (!payment) {
    return NextResponse.json({ ok: true, skipped: "payment not found" });
  }

  if (payment.status === "SUCCEEDED" || payment.status === "FAILED") {
    return NextResponse.json({ ok: true, skipped: "already processed" });
  }

  if (payToken && !payment.chariowTxnId) {
    await prisma.payment.update({
      where: { id: reference },
      data: { chariowTxnId: payToken },
    });
  }

  switch (status) {
    case "SUCCESS":
    case "SUCCESSFULL":
      await confirmPayment(reference);
      break;
    case "FAILED":
    case "CANCELLED":
      await failPayment(reference);
      break;
    default:
      break;
  }

  return NextResponse.json({ ok: true, status });
}
