import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  SUCCEEDED: "success",
  PENDING: "warning",
  REQUIRES_ACTION: "warning",
  FAILED: "danger",
  REFUNDED: "default",
  CANCELLED: "default",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  REQUIRES_ACTION: "Action requise",
  SUCCEEDED: "Réussi",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
  CANCELLED: "Annulé",
};

export default async function ClientPaiementsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const payments = await prisma.payment.findMany({
    where: { order: { buyerUserId: session.user.id } },
    include: {
      order: {
        select: { id: true, service: { select: { title: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mes paiements</h1>

      {payments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CreditCard className="h-8 w-8" />}
            title="Aucun paiement"
            description="Vos paiements apparaîtront ici après avoir passé commande."
            actionLabel="Parcourir les services"
            actionHref="/services"
          />
        </Card>
      ) : (
        <Card>
          <CardTitle className="mb-4">Historique des paiements</CardTitle>
          <div className="divide-y divide-gray-100">
            {payments.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {p.order.service.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(p.createdAt)} · #{p.order.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(p.amountMinor)}
                  </span>
                  <Badge variant={STATUS_VARIANT[p.status] ?? "default"}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
