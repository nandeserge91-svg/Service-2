import { prisma } from "./prisma";

export const ACCOUNT_CODES = {
  PLATFORM_CLEARING: "PLATFORM_CLEARING",
  PLATFORM_COMMISSION: "PLATFORM_COMMISSION",
  ESCROW: "ESCROW",
  sellerPayable: (userId: string) => `SELLER_PAYABLE_${userId}`,
} as const;

const ACCOUNT_LABELS: Record<string, string> = {
  PLATFORM_CLEARING: "Plateforme — Compensation",
  PLATFORM_COMMISSION: "Plateforme — Commissions",
  ESCROW: "Séquestre",
};

interface LedgerLineInput {
  accountCode: string;
  side: "DEBIT" | "CREDIT";
  amountMinor: bigint;
  currency: string;
}

export async function getOrCreateAccount(
  code: string,
  ownerUserId?: string,
) {
  const existing = await prisma.ledgerAccount.findUnique({ where: { code } });
  if (existing) return existing;

  return prisma.ledgerAccount.create({
    data: {
      code,
      label: ACCOUNT_LABELS[code] ?? `Compte vendeur ${ownerUserId ?? ""}`.trim(),
      ownerUserId: ownerUserId ?? null,
    },
  });
}

/**
 * Create a balanced journal entry. Throws if debits !== credits.
 */
export async function createJournalEntry(
  referenceType: string,
  referenceId: string,
  description: string,
  lines: LedgerLineInput[],
) {
  let totalDebit = BigInt(0);
  let totalCredit = BigInt(0);

  for (const l of lines) {
    if (l.side === "DEBIT") totalDebit += l.amountMinor;
    else totalCredit += l.amountMinor;
  }

  if (totalDebit !== totalCredit) {
    throw new Error(
      `Ledger imbalance: debit=${totalDebit} credit=${totalCredit} for ${referenceType}/${referenceId}`,
    );
  }

  const accounts = await Promise.all(
    lines.map((l) => getOrCreateAccount(l.accountCode)),
  );

  return prisma.ledgerJournal.create({
    data: {
      referenceType,
      referenceId,
      description,
      lines: {
        create: lines.map((l, i) => ({
          accountId: accounts[i].id,
          side: l.side,
          amountMinor: l.amountMinor,
          currency: l.currency,
        })),
      },
    },
    include: { lines: true },
  });
}
