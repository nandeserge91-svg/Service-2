import { Prisma, type PrismaClient } from "@prisma/client";

export const ANALYTICS_DAY_OPTIONS = [7, 30, 90] as const;
export type AnalyticsDays = (typeof ANALYTICS_DAY_OPTIONS)[number];

export function clampAnalyticsDays(raw: string | undefined): AnalyticsDays {
  const n = Number(raw);
  if (n === 90) return 90;
  if (n === 7) return 7;
  return 30;
}

/** Premier jour (UTC minuit) de la fenêtre glissante : `days` jours calendaires jusqu’à aujourd’hui inclus. */
export function startDateForLastDays(days: AnalyticsDays): Date {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const d = new Date(end);
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return d;
}

/** Clé jour UTC YYYY-MM-DD */
export function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function fillDailyCounts(
  from: Date,
  days: AnalyticsDays,
  counts: Map<string, number>,
): { key: string; label: string; value: number }[] {
  const out: { key: string; label: string; value: number }[] = [];
  const cursor = new Date(from);
  for (let i = 0; i < days; i++) {
    const key = utcDayKey(cursor);
    const [y, m, day] = key.split("-").map(Number);
    const label =
      days <= 14
        ? `${String(day).padStart(2, "0")}/${String(m).padStart(2, "0")}`
        : `${String(day).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
    out.push({ key, label, value: counts.get(key) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

export type SellerPerformanceResult = {
  days: AnalyticsDays;
  from: Date;
  summary: {
    ordersCreated: number;
    ordersCompleted: number;
    ordersActive: number;
    ordersCancelled: number;
    revenueCompletedMinor: bigint;
    completionRatePercent: number | null;
  };
  ordersPerDay: { key: string; label: string; value: number }[];
  revenuePerDay: { key: string; label: string; valueMinor: bigint }[];
  topServices: { serviceId: string; title: string; orders: number; revenueMinor: bigint }[];
};

const ACTIVE_STATUSES = ["IN_PROGRESS", "DELIVERED", "REVISION_REQUESTED"] as const;

export async function getSellerPerformance(
  db: PrismaClient,
  sellerUserId: string,
  days: AnalyticsDays,
): Promise<SellerPerformanceResult> {
  const from = startDateForLastDays(days);

  const orders = await db.order.findMany({
    where: { sellerUserId, createdAt: { gte: from } },
    select: {
      id: true,
      status: true,
      subtotalMinor: true,
      createdAt: true,
      completedAt: true,
      serviceId: true,
      service: { select: { title: true } },
    },
  });

  const completedInRange = orders.filter(
    (o) =>
      o.status === "COMPLETED" &&
      o.completedAt &&
      o.completedAt >= from,
  );

  const revenueCompletedMinor = completedInRange.reduce((s, o) => s + o.subtotalMinor, BigInt(0));

  const ordersCreated = orders.length;
  const ordersCompleted = completedInRange.length;
  const ordersActive = orders.filter((o) => ACTIVE_STATUSES.includes(o.status as (typeof ACTIVE_STATUSES)[number]))
    .length;
  const ordersCancelled = orders.filter((o) => o.status === "CANCELLED").length;

  let completionRatePercent: number | null = null;
  const terminal = ordersCompleted + ordersCancelled;
  if (terminal > 0) {
    completionRatePercent = Math.round((ordersCompleted / terminal) * 100);
  }

  const countByDay = new Map<string, number>();
  const revenueByDay = new Map<string, bigint>();
  for (const o of orders) {
    const k = utcDayKey(o.createdAt);
    countByDay.set(k, (countByDay.get(k) ?? 0) + 1);
  }
  for (const o of completedInRange) {
    if (!o.completedAt) continue;
    const k = utcDayKey(o.completedAt);
    revenueByDay.set(k, (revenueByDay.get(k) ?? BigInt(0)) + o.subtotalMinor);
  }

  const serviceAgg = new Map<string, { title: string; orders: number; revenueMinor: bigint }>();
  for (const o of orders) {
    const cur = serviceAgg.get(o.serviceId) ?? {
      title: o.service.title,
      orders: 0,
      revenueMinor: BigInt(0),
    };
    cur.orders += 1;
    if (o.status === "COMPLETED") cur.revenueMinor += o.subtotalMinor;
    serviceAgg.set(o.serviceId, cur);
  }

  const topServices = [...serviceAgg.entries()]
    .map(([serviceId, v]) => ({ serviceId, title: v.title, orders: v.orders, revenueMinor: v.revenueMinor }))
    .sort((a, b) => Number(b.revenueMinor - a.revenueMinor) || b.orders - a.orders)
    .slice(0, 8);

  const ordersPerDay = fillDailyCounts(from, days, countByDay);
  const revenueSeries = fillDailyCounts(from, days, new Map());
  const revenuePerDay = revenueSeries.map(({ key, label }) => ({
    key,
    label,
    valueMinor: revenueByDay.get(key) ?? BigInt(0),
  }));

  return {
    days,
    from,
    summary: {
      ordersCreated,
      ordersCompleted,
      ordersActive,
      ordersCancelled,
      revenueCompletedMinor,
      completionRatePercent,
    },
    ordersPerDay,
    revenuePerDay,
    topServices,
  };
}

export type AdminAnalyticsResult = {
  days: AnalyticsDays;
  from: Date;
  ordersCreatedPerDay: { key: string; label: string; value: number }[];
  usersCreatedPerDay: { key: string; label: string; value: number }[];
  completedGmvPerDay: { key: string; label: string; valueMinor: bigint }[];
  completedCountPerDay: { key: string; label: string; value: number }[];
  platformFeePerDay: { key: string; label: string; valueMinor: bigint }[];
  totals: {
    ordersCreated: number;
    usersCreated: number;
    ordersCompleted: number;
    gmvCompletedMinor: bigint;
    platformFeeMinor: bigint;
  };
};

export async function getAdminPlatformAnalytics(
  db: PrismaClient,
  days: AnalyticsDays,
): Promise<AdminAnalyticsResult> {
  const from = startDateForLastDays(days);

  const [orderRows, userRows, completedRows] = await Promise.all([
    db.$queryRaw<Array<{ d: Date; c: bigint }>>(
      Prisma.sql`
        SELECT date_trunc('day', "createdAt" AT TIME ZONE 'UTC')::date AS d, COUNT(*)::bigint AS c
        FROM "Order"
        WHERE "createdAt" >= ${from}
        GROUP BY 1
        ORDER BY 1
      `,
    ),
    db.$queryRaw<Array<{ d: Date; c: bigint }>>(
      Prisma.sql`
        SELECT date_trunc('day', "createdAt" AT TIME ZONE 'UTC')::date AS d, COUNT(*)::bigint AS c
        FROM "User"
        WHERE "createdAt" >= ${from}
        GROUP BY 1
        ORDER BY 1
      `,
    ),
    db.$queryRaw<Array<{ d: Date; n: bigint; gmv: bigint; fees: bigint }>>(
      Prisma.sql`
        SELECT
          date_trunc('day', "completedAt" AT TIME ZONE 'UTC')::date AS d,
          COUNT(*)::bigint AS n,
          COALESCE(SUM("subtotalMinor"), 0)::bigint AS gmv,
          COALESCE(SUM("platformFeeMinor"), 0)::bigint AS fees
        FROM "Order"
        WHERE "status" = 'COMPLETED'
          AND "completedAt" IS NOT NULL
          AND "completedAt" >= ${from}
        GROUP BY 1
        ORDER BY 1
      `,
    ),
  ]);

  const toMap = (rows: Array<{ d: Date; c: bigint }>) => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const key = r.d.toISOString().slice(0, 10);
      m.set(key, Number(r.c));
    }
    return m;
  };

  const orderMap = toMap(orderRows);
  const userMap = toMap(userRows);

  const completedGmvMap = new Map<string, bigint>();
  const completedCountMap = new Map<string, number>();
  const feeMap = new Map<string, bigint>();
  let ordersCompleted = 0;
  let gmvCompletedMinor = BigInt(0);
  let platformFeeMinor = BigInt(0);
  for (const r of completedRows) {
    const key = r.d.toISOString().slice(0, 10);
    completedCountMap.set(key, Number(r.n));
    completedGmvMap.set(key, r.gmv);
    feeMap.set(key, r.fees);
    ordersCompleted += Number(r.n);
    gmvCompletedMinor += r.gmv;
    platformFeeMinor += r.fees;
  }

  const ordersCreated = [...orderMap.values()].reduce((a, b) => a + b, 0);
  const usersCreated = [...userMap.values()].reduce((a, b) => a + b, 0);

  const baseSeries = fillDailyCounts(from, days, new Map());
  const ordersCreatedPerDay = baseSeries.map(({ key, label }) => ({
    key,
    label,
    value: orderMap.get(key) ?? 0,
  }));
  const usersCreatedPerDay = baseSeries.map(({ key, label }) => ({
    key,
    label,
    value: userMap.get(key) ?? 0,
  }));
  const completedGmvPerDay = baseSeries.map(({ key, label }) => ({
    key,
    label,
    valueMinor: completedGmvMap.get(key) ?? BigInt(0),
  }));
  const completedCountPerDay = baseSeries.map(({ key, label }) => ({
    key,
    label,
    value: completedCountMap.get(key) ?? 0,
  }));
  const platformFeePerDay = baseSeries.map(({ key, label }) => ({
    key,
    label,
    valueMinor: feeMap.get(key) ?? BigInt(0),
  }));

  return {
    days,
    from,
    ordersCreatedPerDay,
    usersCreatedPerDay,
    completedGmvPerDay,
    completedCountPerDay,
    platformFeePerDay,
    totals: {
      ordersCreated,
      usersCreated,
      ordersCompleted,
      gmvCompletedMinor,
      platformFeeMinor,
    },
  };
}

export type BuyerHistoryResult = {
  days: AnalyticsDays;
  from: Date;
  completedOrders: Array<{
    id: string;
    completedAt: Date;
    totalMinor: bigint;
    serviceTitle: string;
  }>;
  monthlySpend: { monthKey: string; label: string; totalMinor: bigint; count: number }[];
  totals: { spentMinor: bigint; orderCount: number };
};

export async function getBuyerSpendHistory(
  db: PrismaClient,
  buyerUserId: string,
  days: AnalyticsDays,
): Promise<BuyerHistoryResult> {
  const from = startDateForLastDays(days);

  const [forAgg, recentRows] = await Promise.all([
    db.order.findMany({
      where: {
        buyerUserId,
        status: "COMPLETED",
        completedAt: { gte: from },
      },
      select: { completedAt: true, totalMinor: true },
    }),
    db.order.findMany({
      where: {
        buyerUserId,
        status: "COMPLETED",
        completedAt: { gte: from },
      },
      orderBy: { completedAt: "desc" },
      take: 50,
      select: {
        id: true,
        completedAt: true,
        totalMinor: true,
        service: { select: { title: true } },
      },
    }),
  ]);

  const monthMap = new Map<string, { totalMinor: bigint; count: number }>();
  let spentMinor = BigInt(0);
  for (const o of forAgg) {
    if (!o.completedAt) continue;
    spentMinor += o.totalMinor;
    const mk = `${o.completedAt.getUTCFullYear()}-${String(o.completedAt.getUTCMonth() + 1).padStart(2, "0")}`;
    const cur = monthMap.get(mk) ?? { totalMinor: BigInt(0), count: 0 };
    cur.totalMinor += o.totalMinor;
    cur.count += 1;
    monthMap.set(mk, cur);
  }

  const monthlySpend = [...monthMap.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([monthKey, v]) => {
      const [y, m] = monthKey.split("-");
      const label = `${m}/${y}`;
      return { monthKey, label, totalMinor: v.totalMinor, count: v.count };
    });

  return {
    days,
    from,
    completedOrders: recentRows.map((o) => ({
      id: o.id,
      completedAt: o.completedAt!,
      totalMinor: o.totalMinor,
      serviceTitle: o.service.title,
    })),
    monthlySpend,
    totals: { spentMinor, orderCount: forAgg.length },
  };
}
