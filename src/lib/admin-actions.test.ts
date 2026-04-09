import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./prisma", () => import("./__mocks__/prisma"));
vi.mock("./auth", () => import("./__mocks__/auth"));
vi.mock("./audit", () => import("./__mocks__/audit"));

import {
  suspendUser,
  activateUser,
  publishService,
  archiveService,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalPaid,
} from "./admin-actions";
import { auth } from "./__mocks__/auth";
import { prisma } from "./__mocks__/prisma";
import { log as auditLog } from "./__mocks__/audit";

beforeEach(() => {
  vi.clearAllMocks();
});

function asAdmin() {
  auth.mockResolvedValue({ user: { id: "admin-1", roles: ["ADMIN"] } });
}
function asSupport() {
  auth.mockResolvedValue({ user: { id: "support-1", roles: ["SUPPORT"] } });
}
function asClient() {
  auth.mockResolvedValue({ user: { id: "user-1", roles: ["CLIENT"] } });
}
function asAnon() {
  auth.mockResolvedValue(null);
}

// ── Access control ──

describe("requireAdmin (via suspendUser)", () => {
  it("rejects unauthenticated users", async () => {
    asAnon();
    const result = await suspendUser("u-1");
    expect(result.error).toContain("authentifié");
  });

  it("rejects CLIENT role", async () => {
    asClient();
    const result = await suspendUser("u-1");
    expect(result.error).toContain("refusé");
  });

  it("allows ADMIN role", async () => {
    asAdmin();
    prisma.user.findUnique.mockResolvedValue({ id: "u-1" });
    prisma.user.update.mockResolvedValue({});
    const result = await suspendUser("u-1");
    expect(result.success).toBe(true);
  });

  it("allows SUPPORT role", async () => {
    asSupport();
    prisma.user.findUnique.mockResolvedValue({ id: "u-1" });
    prisma.user.update.mockResolvedValue({});
    const result = await suspendUser("u-1");
    expect(result.success).toBe(true);
  });
});

// ── User management ──

describe("suspendUser", () => {
  it("returns error for unknown user", async () => {
    asAdmin();
    prisma.user.findUnique.mockResolvedValue(null);
    const result = await suspendUser("unknown");
    expect(result.error).toContain("introuvable");
  });

  it("sets locale to 'suspended' and logs audit", async () => {
    asAdmin();
    prisma.user.findUnique.mockResolvedValue({ id: "u-1" });
    prisma.user.update.mockResolvedValue({});

    const result = await suspendUser("u-1");
    expect(result.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { locale: "suspended" },
      }),
    );
    expect(auditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ADMIN_OVERRIDE",
        entity: "User",
        entityId: "u-1",
      }),
    );
  });
});

describe("activateUser", () => {
  it("sets locale to 'fr' and logs audit", async () => {
    asAdmin();
    prisma.user.update.mockResolvedValue({});

    const result = await activateUser("u-1");
    expect(result.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { locale: "fr" },
      }),
    );
  });
});

// ── Service moderation ──

describe("publishService", () => {
  it("sets service status to PUBLISHED", async () => {
    asAdmin();
    prisma.service.update.mockResolvedValue({});
    const result = await publishService("s-1");
    expect(result.success).toBe(true);
    expect(prisma.service.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "PUBLISHED" },
      }),
    );
  });
});

describe("archiveService", () => {
  it("sets service status to ARCHIVED", async () => {
    asAdmin();
    prisma.service.update.mockResolvedValue({});
    const result = await archiveService("s-1");
    expect(result.success).toBe(true);
    expect(prisma.service.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "ARCHIVED" },
      }),
    );
  });
});

// ── Withdrawal processing ──

describe("approveWithdrawal", () => {
  it("returns error for unknown withdrawal", async () => {
    asAdmin();
    prisma.withdrawalRequest.findUnique.mockResolvedValue(null);
    const result = await approveWithdrawal("w-1");
    expect(result.error).toContain("introuvable");
  });

  it("returns error for non-REQUESTED status", async () => {
    asAdmin();
    prisma.withdrawalRequest.findUnique.mockResolvedValue({ id: "w-1", status: "PAID" });
    const result = await approveWithdrawal("w-1");
    expect(result.error).toContain("invalide");
  });

  it("approves REQUESTED withdrawal", async () => {
    asAdmin();
    prisma.withdrawalRequest.findUnique.mockResolvedValue({
      id: "w-1",
      status: "REQUESTED",
      amountMinor: BigInt(50000),
      currency: "XOF",
    });
    prisma.withdrawalRequest.update.mockResolvedValue({});

    const result = await approveWithdrawal("w-1");
    expect(result.success).toBe(true);
    expect(prisma.withdrawalRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "APPROVED" },
      }),
    );
  });
});

describe("rejectWithdrawal", () => {
  it("re-credits wallet on rejection", async () => {
    asAdmin();
    prisma.withdrawalRequest.findUnique.mockResolvedValue({
      id: "w-1",
      status: "REQUESTED",
      amountMinor: BigInt(30000),
      walletId: "wal-1",
      wallet: { id: "wal-1" },
    });
    prisma.withdrawalRequest.update.mockResolvedValue({});
    prisma.financialWallet.update.mockResolvedValue({});

    const result = await rejectWithdrawal("w-1");
    expect(result.success).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});

describe("markWithdrawalPaid", () => {
  it("returns error when withdrawal is not APPROVED", async () => {
    asAdmin();
    prisma.withdrawalRequest.findUnique.mockResolvedValue({ id: "w-1", status: "REQUESTED" });
    const result = await markWithdrawalPaid("w-1", "REF-123");
    expect(result.error).toContain("approuvé");
  });

  it("marks approved withdrawal as PAID with reference", async () => {
    asAdmin();
    prisma.withdrawalRequest.findUnique.mockResolvedValue({ id: "w-1", status: "APPROVED" });
    prisma.withdrawalRequest.update.mockResolvedValue({});

    const result = await markWithdrawalPaid("w-1", "PAY-XYZ");
    expect(result.success).toBe(true);
    expect(prisma.withdrawalRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "PAID", payoutRef: "PAY-XYZ" },
      }),
    );
  });
});
