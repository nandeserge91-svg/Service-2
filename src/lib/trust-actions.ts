"use server";

import { prisma } from "./prisma";

/**
 * Compute trust score for a user based on order history, disputes, and reports.
 */
export async function computeTrustScore(userId: string): Promise<number> {
  const [orderStats, disputeCount, flagCount] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      where: { OR: [{ buyerUserId: userId }, { sellerUserId: userId }] },
      _count: true,
    }),
    prisma.dispute.count({
      where: {
        OR: [
          { order: { buyerUserId: userId } },
          { order: { sellerUserId: userId } },
        ],
      },
    }),
    prisma.report.count({
      where: { targetType: "USER", targetId: userId, status: { not: "DISMISSED" } },
    }),
  ]);

  const totalOrders = orderStats.reduce((s, g) => s + g._count, 0);
  const completedOrders = orderStats
    .filter((g) => g.status === "COMPLETED")
    .reduce((s, g) => s + g._count, 0);

  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const disputeRate = totalOrders > 0 ? Math.round((disputeCount / totalOrders) * 100) : 0;

  let score = 100;
  // Penalties
  if (completionRate < 80) score -= Math.round((80 - completionRate) * 0.5);
  if (disputeRate > 5) score -= Math.round((disputeRate - 5) * 2);
  score -= flagCount * 5;
  score = Math.max(0, Math.min(100, score));

  await prisma.trustScore.upsert({
    where: { userId },
    create: {
      userId,
      score,
      orderCompletionRate: completionRate,
      disputeRate,
      flagCount,
      lastComputedAt: new Date(),
    },
    update: {
      score,
      orderCompletionRate: completionRate,
      disputeRate,
      flagCount,
      lastComputedAt: new Date(),
    },
  });

  return score;
}

export async function getTrustScore(userId: string) {
  return prisma.trustScore.findUnique({ where: { userId } });
}

export async function checkSpendingLimit(
  userId: string,
  amountMinor: bigint,
  currency: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const limit = await prisma.spendingLimit.findFirst({
    where: {
      active: true,
      currency,
      OR: [
        { scope: "USER", userId },
        { scope: "GLOBAL", userId: null },
      ],
    },
    orderBy: { scope: "asc" },
  });

  if (!limit) return { allowed: true };

  const [dailySpent, monthlySpent] = await Promise.all([
    prisma.order.aggregate({
      where: { buyerUserId: userId, currency, createdAt: { gte: startOfDay } },
      _sum: { totalMinor: true },
    }),
    prisma.order.aggregate({
      where: { buyerUserId: userId, currency, createdAt: { gte: startOfMonth } },
      _sum: { totalMinor: true },
    }),
  ]);

  const dailyTotal = (dailySpent._sum.totalMinor ?? BigInt(0)) + amountMinor;
  const monthlyTotal = (monthlySpent._sum.totalMinor ?? BigInt(0)) + amountMinor;

  if (dailyTotal > limit.dailyMinor) {
    return { allowed: false, reason: "Limite de dépense journalière atteinte." };
  }
  if (monthlyTotal > limit.monthlyMinor) {
    return { allowed: false, reason: "Limite de dépense mensuelle atteinte." };
  }

  return { allowed: true };
}
