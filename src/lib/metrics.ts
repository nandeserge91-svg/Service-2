import { prisma } from "./prisma";

/**
 * Business metrics for the observability dashboard (Phase 7.3).
 */

export async function getPlatformMetrics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400_000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400_000);

  const [
    totalUsers,
    newUsers30d,
    totalOrders,
    orders7d,
    completedOrders,
    cancelledOrders,
    disputeCount,
    openDisputes,
    avgResolutionTime,
    paymentStats,
    gmv30d,
    commissions30d,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.dispute.count(),
    prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.$queryRaw<[{ avg_hours: number | null }]>`
      SELECT AVG(EXTRACT(EPOCH FROM ("resolvedAt" - "createdAt")) / 3600) as avg_hours
      FROM "Dispute"
      WHERE "resolvedAt" IS NOT NULL
    `.then((r) => r[0]?.avg_hours ?? null).catch(() => null),
    prisma.payment.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: "COMPLETED", completedAt: { gte: thirtyDaysAgo } },
      _sum: { totalMinor: true },
    }),
    prisma.order.aggregate({
      where: { status: "COMPLETED", completedAt: { gte: thirtyDaysAgo } },
      _sum: { platformFeeMinor: true },
    }),
  ]);

  const completionRate = totalOrders > 0
    ? Math.round((completedOrders / totalOrders) * 100)
    : 0;
  const disputeRate = totalOrders > 0
    ? Math.round((disputeCount / totalOrders) * 100)
    : 0;
  const cancellationRate = totalOrders > 0
    ? Math.round((cancelledOrders / totalOrders) * 100)
    : 0;

  const paymentSuccessCount = paymentStats.find((p) => p.status === "SUCCEEDED")?._count ?? 0;
  const paymentFailCount = paymentStats.find((p) => p.status === "FAILED")?._count ?? 0;
  const paymentTotal = paymentSuccessCount + paymentFailCount;
  const paymentSuccessRate = paymentTotal > 0
    ? Math.round((paymentSuccessCount / paymentTotal) * 100)
    : 0;

  return {
    users: { total: totalUsers, new30d: newUsers30d },
    orders: {
      total: totalOrders,
      last7d: orders7d,
      completionRate,
      cancellationRate,
    },
    disputes: {
      total: disputeCount,
      open: openDisputes,
      rate: disputeRate,
      avgResolutionHours: avgResolutionTime ? Math.round(avgResolutionTime) : null,
    },
    payments: {
      successRate: paymentSuccessRate,
      failCount: paymentFailCount,
    },
    gmv: {
      last30d: gmv30d._sum.totalMinor ?? BigInt(0),
      commissions30d: commissions30d._sum.platformFeeMinor ?? BigInt(0),
    },
  };
}
