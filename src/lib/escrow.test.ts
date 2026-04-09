import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./prisma", () => import("./__mocks__/prisma"));
vi.mock("./ledger", () => ({
  ACCOUNT_CODES: {
    PLATFORM_CLEARING: "PLATFORM_CLEARING",
    PLATFORM_COMMISSION: "PLATFORM_COMMISSION",
    ESCROW: "ESCROW",
    sellerPayable: (id: string) => `SELLER_PAYABLE_${id}`,
  },
  createJournalEntry: vi.fn().mockResolvedValue({ id: "j-1" }),
}));

import { holdEscrow, releaseEscrow, freezeEscrow, refundEscrow } from "./escrow";
import { prisma } from "./__mocks__/prisma";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("holdEscrow", () => {
  it("returns existing HELD escrow without creating a new one", async () => {
    const existing = { id: "esc-1", orderId: "o1", status: "HELD" };
    prisma.order.findUniqueOrThrow.mockResolvedValue({ id: "o1", totalMinor: BigInt(50000), currency: "XOF" });
    prisma.escrowState.findUnique.mockResolvedValue(existing);

    const result = await holdEscrow("o1");
    expect(result).toBe(existing);
    expect(prisma.escrowState.upsert).not.toHaveBeenCalled();
  });

  it("creates escrow HELD state for new order", async () => {
    prisma.order.findUniqueOrThrow.mockResolvedValue({ id: "o1", totalMinor: BigInt(50000), currency: "XOF" });
    prisma.escrowState.findUnique.mockResolvedValue(null);
    const created = { id: "esc-new", orderId: "o1", status: "HELD" };
    prisma.escrowState.upsert.mockResolvedValue(created);

    const result = await holdEscrow("o1");
    expect(result).toBe(created);
    expect(prisma.escrowState.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orderId: "o1" },
        create: expect.objectContaining({ status: "HELD" }),
      }),
    );
  });
});

describe("releaseEscrow", () => {
  it("throws when escrow is not HELD", async () => {
    prisma.order.findUniqueOrThrow.mockResolvedValue({
      id: "o1",
      seller: { sellerProfile: { id: "sp-1" } },
    });
    prisma.escrowState.findUnique.mockResolvedValue({ orderId: "o1", status: "RELEASED" });

    await expect(releaseEscrow("o1")).rejects.toThrow("Cannot release");
  });

  it("throws when no escrow exists", async () => {
    prisma.order.findUniqueOrThrow.mockResolvedValue({
      id: "o1",
      seller: { sellerProfile: { id: "sp-1" } },
    });
    prisma.escrowState.findUnique.mockResolvedValue(null);

    await expect(releaseEscrow("o1")).rejects.toThrow("Cannot release");
  });

  it("throws when seller has no profile", async () => {
    prisma.order.findUniqueOrThrow.mockResolvedValue({
      id: "o1",
      subtotalMinor: BigInt(45000),
      platformFeeMinor: BigInt(5000),
      totalMinor: BigInt(50000),
      currency: "XOF",
      sellerUserId: "u-seller",
      seller: { sellerProfile: null },
    });
    prisma.escrowState.findUnique.mockResolvedValue({ orderId: "o1", status: "HELD" });

    await expect(releaseEscrow("o1")).rejects.toThrow("Seller profile");
  });

  it("releases escrow and credits wallet", async () => {
    prisma.order.findUniqueOrThrow.mockResolvedValue({
      id: "o1",
      subtotalMinor: BigInt(45000),
      platformFeeMinor: BigInt(5000),
      totalMinor: BigInt(50000),
      currency: "XOF",
      sellerUserId: "u-seller",
      seller: { sellerProfile: { id: "sp-1" } },
    });
    prisma.escrowState.findUnique.mockResolvedValue({ orderId: "o1", status: "HELD" });
    prisma.escrowState.update.mockResolvedValue({});
    prisma.financialWallet.upsert.mockResolvedValue({});

    await releaseEscrow("o1");
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});

describe("freezeEscrow", () => {
  it("updates escrow status to FROZEN_DISPUTE", async () => {
    prisma.escrowState.update.mockResolvedValue({});
    await freezeEscrow("o1");
    expect(prisma.escrowState.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orderId: "o1" },
        data: { status: "FROZEN_DISPUTE" },
      }),
    );
  });
});

describe("refundEscrow", () => {
  it("throws when escrow is RELEASED", async () => {
    prisma.order.findUniqueOrThrow.mockResolvedValue({ id: "o1" });
    prisma.escrowState.findUnique.mockResolvedValue({ orderId: "o1", status: "RELEASED" });

    await expect(refundEscrow("o1")).rejects.toThrow("Cannot refund");
  });

  it("refunds from HELD status", async () => {
    prisma.order.findUniqueOrThrow.mockResolvedValue({ id: "o1", currency: "XOF" });
    prisma.escrowState.findUnique.mockResolvedValue({
      orderId: "o1",
      status: "HELD",
      heldMinor: BigInt(50000),
    });
    prisma.escrowState.update.mockResolvedValue({});

    await refundEscrow("o1");
    expect(prisma.escrowState.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "REFUNDED" }),
      }),
    );
  });

  it("refunds from FROZEN_DISPUTE status", async () => {
    prisma.order.findUniqueOrThrow.mockResolvedValue({ id: "o1", currency: "XOF" });
    prisma.escrowState.findUnique.mockResolvedValue({
      orderId: "o1",
      status: "FROZEN_DISPUTE",
      heldMinor: BigInt(30000),
    });
    prisma.escrowState.update.mockResolvedValue({});

    await refundEscrow("o1");
    expect(prisma.escrowState.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "REFUNDED" }),
      }),
    );
  });
});
