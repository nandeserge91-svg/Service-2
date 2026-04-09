import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { AnalyticsBarChart } from "@/components/analytics/analytics-bar-chart";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ANALYTICS_DAY_OPTIONS,
  clampAnalyticsDays,
  getBuyerSpendHistory,
} from "@/lib/analytics";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { History, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientHistoriquePage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const sp = await searchParams;
  const days = clampAnalyticsDays(sp.days);
  const data = await getBuyerSpendHistory(prisma, session.user.id, days);

  const monthBars = [...data.monthlySpend]
    .reverse()
    .map((m) => ({
      label: m.label,
      value: Number(m.totalMinor),
      hint: formatPrice(m.totalMinor),
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="h-7 w-7 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Historique d&apos;achat</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {ANALYTICS_DAY_OPTIONS.map((d) => (
            <Link
              key={d}
              href={`/tableau-de-bord/client/historique?days=${d}`}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                days === d
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              {d} jours
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card padding="sm">
          <p className="text-2xl font-bold text-gray-900">{data.totals.orderCount}</p>
          <p className="text-xs text-gray-500">Commandes terminées</p>
        </Card>
        <Card padding="sm">
          <p className="text-2xl font-bold text-gray-900">{formatPrice(data.totals.spentMinor)}</p>
          <p className="text-xs text-gray-500">Total dépensé (période)</p>
        </Card>
      </div>

      {monthBars.length > 0 ? (
        <Card>
          <CardTitle className="mb-4">Dépenses par mois (commandes clôturées)</CardTitle>
          <AnalyticsBarChart title="" points={monthBars} />
        </Card>
      ) : null}

      <Card>
        <CardTitle className="mb-4">Dernières commandes terminées</CardTitle>
        {data.completedOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-8 w-8" />}
            title="Aucun achat sur cette période"
            description="Les commandes payées et terminées apparaîtront ici."
            actionLabel="Parcourir les services"
            actionHref="/services"
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.completedOrders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div className="min-w-0">
                  <Link
                    href={`/tableau-de-bord/client/commandes/${o.id}`}
                    className="font-medium text-primary-600 hover:underline"
                  >
                    {o.serviceTitle}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {formatDate(o.completedAt)}
                  </p>
                </div>
                <span className="font-semibold text-gray-900">{formatPrice(o.totalMinor)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
