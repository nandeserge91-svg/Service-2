import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock("./prisma", () => ({
  prisma: {
    emailOutbox: {
      findMany: (...a: unknown[]) => mockFindMany(...a),
      create: (...a: unknown[]) => mockCreate(...a),
      update: (...a: unknown[]) => mockUpdate(...a),
    },
  },
}));

vi.mock("./email", () => ({
  sendMail: vi.fn().mockResolvedValue(true),
  sendOrderCreatedBuyer: vi.fn().mockResolvedValue(true),
}));

describe("processEmailOutboxBatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks row SENT after successful dispatch", async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        id: "o1",
        kind: "contact",
        payload: { to: "a@b.com", subject: "S", html: "<p>x</p>" },
        attempts: 0,
      },
    ]);
    mockUpdate.mockResolvedValue({});

    const { processEmailOutboxBatch } = await import("./outbox-email");
    const r = await processEmailOutboxBatch(10);
    expect(r.processed).toBe(1);
    expect(r.errors).toBe(0);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "o1" },
        data: expect.objectContaining({ status: "SENT" }),
      }),
    );
  });

  it("increments attempts on failure", async () => {
    const { sendMail } = await import("./email");
    vi.mocked(sendMail).mockRejectedValueOnce(new Error("smtp down"));

    mockFindMany.mockResolvedValueOnce([
      {
        id: "o2",
        kind: "contact",
        payload: { to: "a@b.com", subject: "S", html: "<p>x</p>" },
        attempts: 0,
      },
    ]);
    mockUpdate.mockResolvedValue({});

    const { processEmailOutboxBatch } = await import("./outbox-email");
    const r = await processEmailOutboxBatch(10);
    expect(r.errors).toBe(1);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "o2" },
        data: expect.objectContaining({ attempts: 1, status: "PENDING" }),
      }),
    );
  });
});

describe("enqueueEmailOutbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({});
  });

  it("creates a pending row", async () => {
    const { enqueueEmailOutbox } = await import("./outbox-email");
    await enqueueEmailOutbox("contact", { to: "x@test.com", subject: "Hi", html: "h" });
    expect(mockCreate).toHaveBeenCalledWith({
      data: { kind: "contact", payload: { to: "x@test.com", subject: "Hi", html: "h" } },
    });
  });
});
