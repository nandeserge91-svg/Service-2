import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./prisma", () => import("./__mocks__/prisma"));

import { ACCOUNT_CODES, createJournalEntry, getOrCreateAccount } from "./ledger";
import { prisma } from "./__mocks__/prisma";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ACCOUNT_CODES", () => {
  it("has constant platform accounts", () => {
    expect(ACCOUNT_CODES.PLATFORM_CLEARING).toBe("PLATFORM_CLEARING");
    expect(ACCOUNT_CODES.PLATFORM_COMMISSION).toBe("PLATFORM_COMMISSION");
    expect(ACCOUNT_CODES.ESCROW).toBe("ESCROW");
  });

  it("generates seller payable codes", () => {
    const code = ACCOUNT_CODES.sellerPayable("user-123");
    expect(code).toBe("SELLER_PAYABLE_user-123");
  });
});

describe("getOrCreateAccount", () => {
  it("returns existing account if found", async () => {
    const existing = { id: "acc-1", code: "ESCROW", label: "Séquestre" };
    prisma.ledgerAccount.findUnique.mockResolvedValue(existing);

    const result = await getOrCreateAccount("ESCROW");
    expect(result).toBe(existing);
    expect(prisma.ledgerAccount.create).not.toHaveBeenCalled();
  });

  it("creates account when not found", async () => {
    prisma.ledgerAccount.findUnique.mockResolvedValue(null);
    const created = { id: "acc-2", code: "ESCROW", label: "Séquestre" };
    prisma.ledgerAccount.create.mockResolvedValue(created);

    const result = await getOrCreateAccount("ESCROW");
    expect(result).toBe(created);
    expect(prisma.ledgerAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: "ESCROW" }),
      }),
    );
  });
});

describe("createJournalEntry", () => {
  it("throws on imbalanced entries", async () => {
    await expect(
      createJournalEntry("TEST", "ref-1", "test", [
        { accountCode: "A", side: "DEBIT", amountMinor: BigInt(1000), currency: "XOF" },
        { accountCode: "B", side: "CREDIT", amountMinor: BigInt(500), currency: "XOF" },
      ]),
    ).rejects.toThrow("Ledger imbalance");
  });

  it("creates balanced entry", async () => {
    prisma.ledgerAccount.findUnique.mockResolvedValue({ id: "acc-1" });
    prisma.ledgerJournal.create.mockResolvedValue({ id: "j-1" });

    await createJournalEntry("ESCROW_HOLD", "order-1", "Test", [
      { accountCode: "PLATFORM_CLEARING", side: "DEBIT", amountMinor: BigInt(10000), currency: "XOF" },
      { accountCode: "ESCROW", side: "CREDIT", amountMinor: BigInt(10000), currency: "XOF" },
    ]);

    expect(prisma.ledgerJournal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          referenceType: "ESCROW_HOLD",
          referenceId: "order-1",
        }),
      }),
    );
  });

  it("rejects when only debits exist", async () => {
    await expect(
      createJournalEntry("TEST", "ref-1", "test", [
        { accountCode: "A", side: "DEBIT", amountMinor: BigInt(500), currency: "XOF" },
      ]),
    ).rejects.toThrow("Ledger imbalance");
  });
});
