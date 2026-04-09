import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./prisma", () => import("./__mocks__/prisma"));
vi.mock("./auth", () => import("./__mocks__/auth"));
vi.mock("./notifications", () => import("./__mocks__/notifications"));
vi.mock("./search", () => import("./__mocks__/search"));

import { submitReview, respondToReview, getSellerReputation } from "./review-actions";
import { auth } from "./__mocks__/auth";
import { prisma } from "./__mocks__/prisma";

function makeForm(data: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("submitReview", () => {
  it("returns error when not authenticated", async () => {
    auth.mockResolvedValue(null);
    const result = await submitReview(makeForm({ orderId: "o1", rating: "5" }));
    expect(result.error).toContain("authentifié");
  });

  it("returns error for invalid rating", async () => {
    auth.mockResolvedValue({ user: { id: "u1", roles: ["CLIENT"] } });
    const result = await submitReview(makeForm({ orderId: "o1", rating: "0" }));
    expect(result.error).toContain("Note");
  });

  it("returns error for rating > 5", async () => {
    auth.mockResolvedValue({ user: { id: "u1", roles: ["CLIENT"] } });
    const result = await submitReview(makeForm({ orderId: "o1", rating: "6" }));
    expect(result.error).toContain("Note");
  });

  it("returns error when order not found", async () => {
    auth.mockResolvedValue({ user: { id: "u1", roles: ["CLIENT"] } });
    prisma.order.findUnique.mockResolvedValue(null);
    const result = await submitReview(makeForm({ orderId: "o1", rating: "4" }));
    expect(result.error).toContain("introuvable");
  });

  it("returns error when user is not the buyer", async () => {
    auth.mockResolvedValue({ user: { id: "u-other", roles: ["CLIENT"] } });
    prisma.order.findUnique.mockResolvedValue({
      id: "o1",
      buyerUserId: "u-buyer",
      sellerUserId: "u-seller",
      serviceId: "s1",
      status: "COMPLETED",
      reviews: [],
      service: { title: "Test" },
    });
    const result = await submitReview(makeForm({ orderId: "o1", rating: "5" }));
    expect(result.error).toContain("acheteur");
  });

  it("returns error when order is not COMPLETED", async () => {
    auth.mockResolvedValue({ user: { id: "u1", roles: ["CLIENT"] } });
    prisma.order.findUnique.mockResolvedValue({
      id: "o1",
      buyerUserId: "u1",
      status: "IN_PROGRESS",
      reviews: [],
      service: { title: "Test" },
    });
    const result = await submitReview(makeForm({ orderId: "o1", rating: "5" }));
    expect(result.error).toContain("terminée");
  });

  it("returns error when review already exists", async () => {
    auth.mockResolvedValue({ user: { id: "u1", roles: ["CLIENT"] } });
    prisma.order.findUnique.mockResolvedValue({
      id: "o1",
      buyerUserId: "u1",
      status: "COMPLETED",
      reviews: [{ id: "r1" }],
      service: { title: "Test" },
    });
    const result = await submitReview(makeForm({ orderId: "o1", rating: "5" }));
    expect(result.error).toContain("déjà");
  });

  it("creates review and returns success", async () => {
    auth.mockResolvedValue({ user: { id: "u1", roles: ["CLIENT"] } });
    prisma.order.findUnique.mockResolvedValue({
      id: "o1",
      buyerUserId: "u1",
      sellerUserId: "u-seller",
      serviceId: "s1",
      status: "COMPLETED",
      reviews: [],
      service: { title: "Logo pro" },
    });
    prisma.review.create.mockResolvedValue({ id: "r-new" });

    const result = await submitReview(
      makeForm({ orderId: "o1", rating: "5", comment: "Super !" }),
    );
    expect(result.success).toBe(true);
    expect(prisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ orderId: "o1", rating: 5 }),
      }),
    );
  });
});

describe("respondToReview", () => {
  it("returns error when not authenticated", async () => {
    auth.mockResolvedValue(null);
    const result = await respondToReview(makeForm({ reviewId: "r1", response: "Merci" }));
    expect(result.error).toContain("authentifié");
  });

  it("returns error when response is empty", async () => {
    auth.mockResolvedValue({ user: { id: "u1", roles: ["SELLER"] } });
    const result = await respondToReview(makeForm({ reviewId: "r1", response: "" }));
    expect(result.error).toContain("vide");
  });

  it("returns error when response exceeds 1000 chars", async () => {
    auth.mockResolvedValue({ user: { id: "u1", roles: ["SELLER"] } });
    const result = await respondToReview(
      makeForm({ reviewId: "r1", response: "a".repeat(1001) }),
    );
    expect(result.error).toContain("trop longue");
  });

  it("returns error when user is not the seller", async () => {
    auth.mockResolvedValue({ user: { id: "u-other", roles: ["SELLER"] } });
    prisma.review.findUnique.mockResolvedValue({
      id: "r1",
      sellerResponse: null,
      order: { sellerUserId: "u-seller" },
    });
    const result = await respondToReview(makeForm({ reviewId: "r1", response: "Merci" }));
    expect(result.error).toContain("refusé");
  });

  it("returns error when already responded", async () => {
    auth.mockResolvedValue({ user: { id: "u-seller", roles: ["SELLER"] } });
    prisma.review.findUnique.mockResolvedValue({
      id: "r1",
      sellerResponse: "Merci !",
      order: { sellerUserId: "u-seller" },
    });
    const result = await respondToReview(makeForm({ reviewId: "r1", response: "Autre réponse" }));
    expect(result.error).toContain("déjà répondu");
  });

  it("updates review with response", async () => {
    auth.mockResolvedValue({ user: { id: "u-seller", roles: ["SELLER"] } });
    prisma.review.findUnique.mockResolvedValue({
      id: "r1",
      sellerResponse: null,
      order: { sellerUserId: "u-seller" },
    });
    prisma.review.update.mockResolvedValue({});

    const result = await respondToReview(makeForm({ reviewId: "r1", response: "Merci beaucoup" }));
    expect(result.success).toBe(true);
    expect(prisma.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "r1" },
        data: expect.objectContaining({ sellerResponse: "Merci beaucoup" }),
      }),
    );
  });
});

describe("getSellerReputation", () => {
  it("returns zeros when no reviews", async () => {
    prisma.review.findMany.mockResolvedValue([]);
    const rep = await getSellerReputation("u-seller");
    expect(rep.averageRating).toBe(0);
    expect(rep.totalReviews).toBe(0);
    expect(rep.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it("calculates correct average and distribution", async () => {
    prisma.review.findMany.mockResolvedValue([
      { rating: 5 },
      { rating: 5 },
      { rating: 4 },
      { rating: 3 },
    ]);
    const rep = await getSellerReputation("u-seller");
    expect(rep.totalReviews).toBe(4);
    expect(rep.averageRating).toBe(4.3);
    expect(rep.distribution[5]).toBe(2);
    expect(rep.distribution[4]).toBe(1);
    expect(rep.distribution[3]).toBe(1);
    expect(rep.distribution[1]).toBe(0);
  });
});
