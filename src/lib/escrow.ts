import { prisma } from "./prisma";
import { createJournalEntry, ACCOUNT_CODES } from "./ledger";

/**
 * Hold funds in escrow when payment succeeds.
 * Creates EscrowState HELD + ledger: DEBIT clearing, CREDIT escrow.
 */
export async function holdEscrow(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
  });

  const existing = await prisma.escrowState.findUnique({
    where: { orderId },
  });
  if (existing?.status === "HELD") return existing;

  const escrow = await prisma.escrowState.upsert({
    where: { orderId },
    update: { status: "HELD", heldMinor: order.totalMinor },
    create: {
      orderId,
      status: "HELD",
      heldMinor: order.totalMinor,
      currency: order.currency,
    },
  });

  await createJournalEntry("ESCROW_HOLD", orderId, "Fonds retenus en séquestre", [
    {
      accountCode: ACCOUNT_CODES.PLATFORM_CLEARING,
      side: "DEBIT",
      amountMinor: order.totalMinor,
      currency: order.currency,
    },
    {
      accountCode: ACCOUNT_CODES.ESCROW,
      side: "CREDIT",
      amountMinor: order.totalMinor,
      currency: order.currency,
    },
  ]);

  return escrow;
}

/**
 * Release escrow to seller wallet when order is COMPLETED.
 * Ledger: DEBIT escrow, CREDIT commission + CREDIT seller payable.
 * Also credits the seller's FinancialWallet.
 */
export async function releaseEscrow(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      seller: { include: { sellerProfile: true } },
    },
  });

  const escrow = await prisma.escrowState.findUnique({ where: { orderId } });
  if (!escrow || escrow.status !== "HELD") {
    throw new Error(`Cannot release escrow for order ${orderId}: status=${escrow?.status}`);
  }

  const sellerProfileId = order.seller.sellerProfile?.id;
  if (!sellerProfileId) throw new Error("Seller profile not found");

  const sellerPayout = order.subtotalMinor;
  const commission = order.platformFeeMinor;

  await prisma.$transaction([
    prisma.escrowState.update({
      where: { orderId },
      data: { status: "RELEASED", releasedAt: new Date() },
    }),
    prisma.financialWallet.upsert({
      where: {
        sellerProfileId_currency: {
          sellerProfileId,
          currency: order.currency,
        },
      },
      update: { availableMinor: { increment: sellerPayout } },
      create: {
        sellerProfileId,
        availableMinor: sellerPayout,
        pendingMinor: BigInt(0),
        currency: order.currency,
      },
    }),
  ]);

  await createJournalEntry(
    "ESCROW_RELEASE",
    orderId,
    "Séquestre libéré — commande terminée",
    [
      {
        accountCode: ACCOUNT_CODES.ESCROW,
        side: "DEBIT",
        amountMinor: order.totalMinor,
        currency: order.currency,
      },
      {
        accountCode: ACCOUNT_CODES.PLATFORM_COMMISSION,
        side: "CREDIT",
        amountMinor: commission,
        currency: order.currency,
      },
      {
        accountCode: ACCOUNT_CODES.sellerPayable(order.sellerUserId),
        side: "CREDIT",
        amountMinor: sellerPayout,
        currency: order.currency,
      },
    ],
  );
}

/**
 * Freeze escrow when a dispute is opened.
 */
export async function freezeEscrow(orderId: string) {
  await prisma.escrowState.update({
    where: { orderId },
    data: { status: "FROZEN_DISPUTE" },
  });
}

/**
 * Refund escrow to buyer (cancellation or dispute resolution).
 * Ledger: DEBIT escrow, CREDIT clearing (money back to buyer).
 */
export async function refundEscrow(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
  });

  const escrow = await prisma.escrowState.findUnique({ where: { orderId } });
  if (!escrow || (escrow.status !== "HELD" && escrow.status !== "FROZEN_DISPUTE")) {
    throw new Error(`Cannot refund escrow for order ${orderId}: status=${escrow?.status}`);
  }

  await prisma.escrowState.update({
    where: { orderId },
    data: { status: "REFUNDED", refundedAt: new Date() },
  });

  await createJournalEntry("ESCROW_REFUND", orderId, "Séquestre remboursé", [
    {
      accountCode: ACCOUNT_CODES.ESCROW,
      side: "DEBIT",
      amountMinor: escrow.heldMinor,
      currency: order.currency,
    },
    {
      accountCode: ACCOUNT_CODES.PLATFORM_CLEARING,
      side: "CREDIT",
      amountMinor: escrow.heldMinor,
      currency: order.currency,
    },
  ]);
}
