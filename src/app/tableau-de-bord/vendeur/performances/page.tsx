import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { AnalyticsBarChart } from "@/components/analytics/analytics-bar-chart";
import {
  ANALYTICS_DAY_OPTIONS,
  clampAnalyticsDays,
  getSellerPerformance,
} from "@/lib/analytics";
import { formatPrice, cn } from "@/lib/utils";
import { BarChart3, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SellerPerformancesPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const sp = await searchParams;
  const days = clampAnalyticsDays(sp.days);
  const data = await getSellerPerformance(prisma, session.user.id, days);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Performances</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {ANALYTICS_DAY_OPTIONS.map((d) => (
            <Link
              key={d}
              href={`/tableau-de-bord/vendeur/performances?days=${d}`}
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

      <p className="text-sm text-gray-500">
        Période : du{" "}
        {data.from.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })} au{" "}
        {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })} (UTC).
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card padding="sm">
          <p className="text-2xl font-bold text-gray-900">{data.summary.ordersCreated}</p>
          <p className="text-xs text-gray-500">Commandes créées</p>
        </Card>
        <Card padding="sm">
          <p className="text-2xl font-bold text-gray-900">{data.summary.ordersCompleted}</p>
          <p className="text-xs text-gray-500">Terminées</p>
        </Card>
        <Card padding="sm">
          <p className="text-2xl font-bold text-gray-900">{data.summary.ordersActive}</p>
          <p className="text-xs text-gray-500">En cours</p>
        </Card>
        <Card padding="sm">
          <p className="text-2xl font-bold text-gray-900">
            {data.summary.completionRatePercent !== null
              ? `${data.summary.completionRatePercent} %`
              : "—"}
          </p>
          <p className="text-xs text-gray-500">Taux complétion (vs annulées)</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success-600" />
          <CardTitle className="mb-0">Chiffre d&apos;affaires (commandes terminées)</CardTitle>
        </div>
        <p className="mb-4 text-2xl font-bold text-gray-900">
          {formatPrice(data.summary.revenueCompletedMinor)}
        </p>
        <AnalyticsBarChart
          title="CA par jour (date de clôture)"
          points={data.revenuePerDay.map((r) => ({
            label: r.label,
            value: Number(r.valueMinor),
            hint: formatPrice(r.valueMinor),
          }))}
        />
      </Card>

      <Card>
        <AnalyticsBarChart
          title="Nouvelles commandes par jour (date de création)"
          points={data.ordersPerDay.map((r) => ({
            label: r.label,
            value: r.value,
          }))}
        />
      </Card>

      <Card>
        <CardTitle className="mb-4">Top services (période)</CardTitle>
        {data.topServices.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune commande sur cette période.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.topServices.map((s) => (
              <li key={s.serviceId} className="flex items-center justify-between py-3 text-sm">
                <span className="truncate font-medium text-gray-900">{s.title}</span>
                <span className="ml-4 shrink-0 text-gray-600">
                  {s.orders} cmd. · {formatPrice(s.revenueMinor)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
