"use server";

import { auth } from "./auth";
import { prisma } from "./prisma";
import * as notif from "./notifications";
import { syncServiceSearchFields } from "./search";

interface ActionResult {
  success?: boolean;
  error?: string;
}

/**
 * Submit a review for a completed order.
 * Only the buyer can review, only once, only on COMPLETED orders.
 */
export async function submitReview(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const orderId = formData.get("orderId") as string;
  const rating = parseInt(formData.get("rating") as string, 10);
  const comment = (formData.get("comment") as string)?.trim() || null;

  if (!orderId) return { error: "Commande manquante." };
  if (!rating || rating < 1 || rating > 5) return { error: "Note entre 1 et 5 requise." };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      service: { select: { title: true } },
      reviews: { select: { id: true } },
    },
  });

  if (!order) return { error: "Commande introuvable." };
  if (order.buyerUserId !== session.user.id) return { error: "Seul l'acheteur peut laisser un avis." };
  if (order.status !== "COMPLETED") return { error: "La commande doit être terminée." };
  if (order.reviews.length > 0) return { error: "Vous avez déjà laissé un avis." };

  await prisma.review.create({
    data: { orderId, rating, comment },
  });

  syncServiceSearchFields(order.serviceId).catch(() => {});

  notif.onReviewReceived({
    orderId,
    sellerUserId: order.sellerUserId,
    serviceTitle: order.service.title,
    rating,
  }).catch(() => {});

  return { success: true };
}

/**
 * Seller responds to a review on one of their orders.
 */
export async function respondToReview(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const reviewId = formData.get("reviewId") as string;
  const response = (formData.get("response") as string)?.trim();

  if (!reviewId) return { error: "Avis manquant." };
  if (!response) return { error: "Votre réponse ne peut pas être vide." };
  if (response.length > 1000) return { error: "Réponse trop longue (max 1000 caractères)." };

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { order: { select: { sellerUserId: true } } },
  });

  if (!review) return { error: "Avis introuvable." };
  if (review.order.sellerUserId !== session.user.id) return { error: "Accès refusé." };
  if (review.sellerResponse) return { error: "Vous avez déjà répondu à cet avis." };

  await prisma.review.update({
    where: { id: reviewId },
    data: { sellerResponse: response, sellerRespondedAt: new Date() },
  });

  return { success: true };
}

/**
 * Calculate seller reputation stats.
 */
export async function getSellerReputation(sellerUserId: string) {
  const reviews = await prisma.review.findMany({
    where: { order: { sellerUserId } },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
  let sum = 0;
  for (const r of reviews) {
    sum += r.rating;
    distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
  }

  return {
    averageRating: Math.round((sum / reviews.length) * 10) / 10,
    totalReviews: reviews.length,
    distribution,
  };
}
