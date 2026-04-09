import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

const DISPUTE_LABEL: Record<string, string> = {
  OPEN: "Ouvert",
  UNDER_REVIEW: "En examen",
  RESOLVED: "Résolu",
  CLOSED: "Fermé",
};

const DISPUTE_VARIANT: Record<string, "warning" | "danger" | "success" | "default"> = {
  OPEN: "warning",
  UNDER_REVIEW: "danger",
  RESOLVED: "success",
  CLOSED: "default",
};

export default async function ClientLitigesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const disputes = await prisma.dispute.findMany({
    where: { order: { buyerUserId: session.user.id } },
    include: {
      order: {
        select: { id: true, service: { select: { title: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mes litiges</h1>

      {disputes.length === 0 ? (
        <Card>
          <EmptyState
            icon={<AlertTriangle className="h-8 w-8" />}
            title="Aucun litige"
            description="Bonne nouvelle ! Vous n'avez aucun litige en cours. En cas de problème avec une commande, vous pouvez ouvrir un litige depuis le détail de la commande."
          />
        </Card>
      ) : (
        <Card>
          <CardTitle className="mb-4">Historique des litiges</CardTitle>
          <div className="divide-y divide-gray-100">
            {disputes.map((d) => (
              <Link
                key={d.id}
                href={`/tableau-de-bord/client/commandes/${d.orderId}`}
                className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {d.order.service.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    Ouvert le {formatDate(d.createdAt)}
                    {d.reason ? ` — ${d.reason.slice(0, 60)}${d.reason.length > 60 ? "…" : ""}` : ""}
                  </p>
                </div>
                <Badge variant={DISPUTE_VARIANT[d.status] ?? "default"}>
                  {DISPUTE_LABEL[d.status] ?? d.status}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
