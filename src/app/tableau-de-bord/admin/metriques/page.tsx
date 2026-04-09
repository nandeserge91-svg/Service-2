import { Card, CardTitle } from "@/components/ui/card";
import { getPlatformMetrics } from "@/lib/metrics";
import { formatPrice } from "@/lib/utils";
import {
  Users, ShoppingBag, AlertTriangle, CreditCard,
  TrendingUp, Clock, Percent, DollarSign,
} from "lucide-react";

export const dynamic = "force-dynamic";

function MetricCard({
  icon: Icon,
  iconColor,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

export default async function AdminMetricsPage() {
  const m = await getPlatformMetrics();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Métriques plateforme</h1>

      {/* KPIs grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          iconColor="bg-primary-50 text-primary-600"
          label="Utilisateurs"
          value={m.users.total}
          sub={`+${m.users.new30d} (30j)`}
        />
        <MetricCard
          icon={ShoppingBag}
          iconColor="bg-success-50 text-success-600"
          label="Commandes"
          value={m.orders.total}
          sub={`${m.orders.last7d} (7j)`}
        />
        <MetricCard
          icon={DollarSign}
          iconColor="bg-warning-50 text-warning-600"
          label="GMV (30j)"
          value={formatPrice(m.gmv.last30d, "XOF")}
          sub={`Commissions: ${formatPrice(m.gmv.commissions30d, "XOF")}`}
        />
        <MetricCard
          icon={CreditCard}
          iconColor="bg-primary-50 text-primary-600"
          label="Taux paiement"
          value={`${m.payments.successRate}%`}
          sub={`${m.payments.failCount} échecs`}
        />
      </div>

      {/* Rates */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-success-500" />
            <div>
              <p className="text-xs text-gray-500">Taux de complétion</p>
              <p className="text-2xl font-bold text-gray-900">{m.orders.completionRate}%</p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-success-500"
              style={{ width: `${m.orders.completionRate}%` }}
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-danger-500" />
            <div>
              <p className="text-xs text-gray-500">Taux de litiges</p>
              <p className="text-2xl font-bold text-gray-900">{m.disputes.rate}%</p>
              <p className="text-[10px] text-gray-400">
                {m.disputes.open} ouvert{m.disputes.open > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-danger-500"
              style={{ width: `${Math.min(m.disputes.rate, 100)}%` }}
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-xs text-gray-500">Résolution litiges</p>
              <p className="text-2xl font-bold text-gray-900">
                {m.disputes.avgResolutionHours !== null
                  ? `${m.disputes.avgResolutionHours}h`
                  : "—"}
              </p>
              <p className="text-[10px] text-gray-400">Temps moyen</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Cancellation */}
      <Card>
        <div className="flex items-center gap-3">
          <Percent className="h-5 w-5 text-warning-500" />
          <div>
            <p className="text-xs text-gray-500">Taux d&apos;annulation</p>
            <p className="text-lg font-bold text-gray-900">{m.orders.cancellationRate}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
