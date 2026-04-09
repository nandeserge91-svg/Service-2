import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import {
  Users, ShoppingBag, Wallet, AlertTriangle, ArrowRight,
  TrendingUp, Store, ArrowDownToLine,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    totalUsers,
    totalSellers,
    totalServices,
    totalOrders,
    activeOrders,
    openDisputes,
    pendingWithdrawals,
    revenueAgg,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.sellerProfile.count(),
    prisma.service.count({ where: { status: "PUBLISHED" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["IN_PROGRESS", "DELIVERED", "REVISION_REQUESTED"] } } }),
    prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.withdrawalRequest.count({ where: { status: "REQUESTED" } }),
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { platformFeeMinor: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        service: { select: { title: true } },
        buyer: { select: { buyerProfile: { select: { displayName: true } } } },
      },
    }),
  ]);

  const totalRevenue = revenueAgg._sum.platformFeeMinor ?? BigInt(0);

  const kpis = [
    { label: "Utilisateurs", value: totalUsers, icon: Users, color: "text-primary-600 bg-primary-50" },
    { label: "Vendeurs", value: totalSellers, icon: Store, color: "text-indigo-600 bg-indigo-50" },
    { label: "Services publiés", value: totalServices, icon: ShoppingBag, color: "text-success-600 bg-success-50" },
    { label: "Commandes totales", value: totalOrders, icon: TrendingUp, color: "text-gray-600 bg-gray-100" },
    { label: "Commandes actives", value: activeOrders, icon: ShoppingBag, color: "text-warning-600 bg-warning-50" },
    { label: "Litiges ouverts", value: openDisputes, icon: AlertTriangle, color: "text-danger-600 bg-danger-50", href: "/tableau-de-bord/admin/litiges" },
    { label: "Retraits en attente", value: pendingWithdrawals, icon: ArrowDownToLine, color: "text-warning-600 bg-warning-50", href: "/tableau-de-bord/admin/retraits" },
    { label: "Revenus plateforme", value: formatPrice(totalRevenue), icon: Wallet, color: "text-success-600 bg-success-50" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Aperçu de la plateforme</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((k) => {
          const content = (
            <Card key={k.label} padding="sm" className="relative">
              <div className={`mb-2 inline-flex rounded-lg p-2 ${k.color}`}>
                <k.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {typeof k.value === "number" ? k.value.toLocaleString("fr-FR") : k.value}
              </p>
              <p className="text-xs text-gray-500">{k.label}</p>
              {k.href && (
                <ArrowRight className="absolute right-3 top-3 h-4 w-4 text-gray-300" />
              )}
            </Card>
          );
          return k.href ? (
            <Link key={k.label} href={k.href}>{content}</Link>
          ) : (
            <div key={k.label}>{content}</div>
          );
        })}
      </div>

      <Card>
        <CardTitle className="mb-4">Dernières commandes</CardTitle>
        <div className="space-y-0">
          {recentOrders.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between border-b border-gray-50 py-3 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {o.service.title}
                </p>
                <p className="text-xs text-gray-400">
                  {o.buyer.buyerProfile?.displayName ?? "Client"} ·{" "}
                  {new Date(o.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(o.totalMinor, o.currency)}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
