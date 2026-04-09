import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { AlertTriangle, Clock, CheckCircle, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<string, { label: string; variant: "warning" | "primary" | "success" | "default" }> = {
  OPEN: { label: "Ouvert", variant: "warning" },
  UNDER_REVIEW: { label: "En examen", variant: "primary" },
  RESOLVED: { label: "Résolu", variant: "success" },
  CLOSED: { label: "Fermé", variant: "default" },
};

export default async function AdminDisputesPage() {
  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      order: {
        select: {
          id: true,
          totalMinor: true,
          currency: true,
          service: { select: { title: true } },
        },
      },
      openedBy: {
        select: {
          image: true,
          buyerProfile: { select: { displayName: true } },
        },
      },
      _count: { select: { messages: true } },
    },
  });

  const openCount = disputes.filter((d) => d.status === "OPEN").length;
  const reviewCount = disputes.filter((d) => d.status === "UNDER_REVIEW").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Gestion des litiges</h1>
        <p className="mt-1 text-sm text-gray-500">
          {openCount} en attente · {reviewCount} en examen
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["OPEN", "UNDER_REVIEW", "RESOLVED", "CLOSED"] as const).map((s) => {
          const count = disputes.filter((d) => d.status === s).length;
          const cfg = STATUS_CONFIG[s];
          return (
            <Card key={s} padding="sm" className="text-center">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{cfg.label}</p>
            </Card>
          );
        })}
      </div>

      {/* List */}
      <Card padding="none">
        {disputes.length === 0 && (
          <div className="px-6 py-12 text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">Aucun litige</p>
          </div>
        )}
        {disputes.map((d) => {
          const cfg = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.OPEN;
          const buyerName = d.openedBy.buyerProfile?.displayName ?? "Client";
          return (
            <Link
              key={d.id}
              href={`/tableau-de-bord/admin/litiges/${d.id}`}
              className="flex items-center gap-4 border-b border-gray-50 px-5 py-4 transition hover:bg-gray-50 last:border-b-0"
            >
              <Avatar name={buyerName} src={d.openedBy.image} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {d.order.service.title}
                </p>
                <p className="text-xs text-gray-500">
                  par {buyerName} · {d._count.messages} message{d._count.messages > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={cfg.variant}>{cfg.label}</Badge>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {new Date(d.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
              </div>
            </Link>
          );
        })}
      </Card>
    </div>
  );
}
