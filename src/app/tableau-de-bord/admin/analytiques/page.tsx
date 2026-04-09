import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { AnalyticsBarChart } from "@/components/analytics/analytics-bar-chart";
import {
  ANALYTICS_DAY_OPTIONS,
  clampAnalyticsDays,
  getAdminPlatformAnalytics,
} from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { BarChart3, LineChart, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalytiquesPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const sp = await searchParams;
  const days = clampAnalyticsDays(sp.days);
  const data = await getAdminPlatformAnalytics(prisma, days);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LineChart className="h-7 w-7 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Analytiques</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {ANALYTICS_DAY_OPTIONS.map((d) => (
            <Link
              key={d}
              href={`/tableau-de-bord/admin/analytiques?days=${d}`}
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
        Agrégations PostgreSQL (créations / clôtures en UTC). Période de{" "}
        {data.ordersCreatedPerDay.length} jours affichés.
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card padding="sm">
          <p className="text-xl font-bold text-gray-900">{data.totals.ordersCreated}</p>
          <p className="text-xs text-gray-500">Commandes créées</p>
        </Card>
        <Card padding="sm">
          <p className="text-xl font-bold text-gray-900">{data.totals.usersCreated}</p>
          <p className="text-xs text-gray-500">Nouveaux comptes</p>
        </Card>
        <Card padding="sm">
          <p className="text-xl font-bold text-gray-900">{data.totals.ordersCompleted}</p>
          <p className="text-xs text-gray-500">Commandes terminées</p>
        </Card>
        <Card padding="sm">
          <p className="text-xl font-bold text-gray-900">{formatPrice(data.totals.gmvCompletedMinor)}</p>
          <p className="text-xs text-gray-500">GMV vendeurs (sous-total)</p>
        </Card>
        <Card padding="sm">
          <p className="text-xl font-bold text-gray-900">{formatPrice(data.totals.platformFeeMinor)}</p>
          <p className="text-xs text-gray-500">Commissions plateforme</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            <CardTitle className="mb-0">Commandes créées / jour</CardTitle>
          </div>
          <AnalyticsBarChart
            title=""
            points={data.ordersCreatedPerDay.map((r) => ({ label: r.label, value: r.value }))}
          />
        </Card>
        <Card>
          <div className="mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <CardTitle className="mb-0">Inscriptions / jour</CardTitle>
          </div>
          <AnalyticsBarChart
            title=""
            points={data.usersCreatedPerDay.map((r) => ({ label: r.label, value: r.value }))}
          />
        </Card>
        <Card>
          <CardTitle className="mb-4">GMV terminé / jour</CardTitle>
          <AnalyticsBarChart
            title=""
            points={data.completedGmvPerDay.map((r) => ({
              label: r.label,
              value: Number(r.valueMinor),
              hint: formatPrice(r.valueMinor),
            }))}
          />
        </Card>
        <Card>
          <CardTitle className="mb-4">Commissions / jour</CardTitle>
          <AnalyticsBarChart
            title=""
            points={data.platformFeePerDay.map((r) => ({
              label: r.label,
              value: Number(r.valueMinor),
              hint: formatPrice(r.valueMinor),
            }))}
          />
        </Card>
      </div>
    </div>
  );
}
