import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { ShoppingBag, Clock } from "lucide-react";

export default async function SellerOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const orders = await prisma.order.findMany({
    where: { sellerUserId: session.user.id },
    include: {
      service: { select: { title: true } },
      buyer: {
        select: { buyerProfile: { select: { displayName: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeCount = orders.filter(
    (o) => !["COMPLETED", "CANCELLED"].includes(o.status),
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Commandes reçues</h1>
        {activeCount > 0 && (
          <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
            {activeCount} active{activeCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ShoppingBag className="h-8 w-8" />}
            title="Aucune commande reçue"
            description="Publiez des services pour commencer à recevoir des commandes."
            actionLabel="Mes services"
            actionHref="/tableau-de-bord/vendeur/services"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const sc = ORDER_STATUS_COLORS[o.status] ?? ORDER_STATUS_COLORS.PENDING_PAYMENT;
            const buyerName = o.buyer.buyerProfile?.displayName ?? "Client";
            return (
              <Link key={o.id} href={`/tableau-de-bord/vendeur/commandes/${o.id}`}>
                <Card hover>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">{o.service.title}</p>
                      <p className="mt-0.5 text-sm text-gray-500">
                        de {buyerName} · #{o.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium text-success-700">
                        {formatPrice(o.subtotalMinor)}
                      </span>
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sc.bg} ${sc.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        {ORDER_STATUS_LABELS[o.status]}
                      </div>
                      {o.deliveryDueAt && o.status !== "COMPLETED" && o.status !== "CANCELLED" && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {new Date(o.deliveryDueAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
