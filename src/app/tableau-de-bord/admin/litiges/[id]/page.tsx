import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/utils";
import { DisputeThread } from "@/components/disputes/dispute-thread";
import { DisputeAdminActions } from "@/components/disputes/dispute-admin-actions";
import { AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react";

export default async function AdminDisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          service: { select: { title: true, slug: true } },
          buyer: {
            select: {
              id: true,
              image: true,
              email: true,
              buyerProfile: { select: { displayName: true } },
            },
          },
          seller: {
            select: {
              id: true,
              image: true,
              email: true,
              sellerProfile: { select: { displayName: true } },
            },
          },
        },
      },
      openedBy: {
        select: {
          buyerProfile: { select: { displayName: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: {
              id: true,
              image: true,
              sellerProfile: { select: { displayName: true } },
              buyerProfile: { select: { displayName: true } },
              roleAssignments: { select: { role: true } },
            },
          },
        },
      },
    },
  });

  if (!dispute) notFound();

  const order = dispute.order;
  const buyerName = order.buyer.buyerProfile?.displayName ?? "Client";
  const sellerName = order.seller.sellerProfile?.displayName ?? "Vendeur";
  const isActive = dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW";

  const statusConfig: Record<string, { label: string; variant: "warning" | "primary" | "success" | "default" }> = {
    OPEN: { label: "Ouvert", variant: "warning" },
    UNDER_REVIEW: { label: "En examen", variant: "primary" },
    RESOLVED: { label: "Résolu", variant: "success" },
    CLOSED: { label: "Fermé", variant: "default" },
  };
  const sc = statusConfig[dispute.status] ?? statusConfig.OPEN;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/tableau-de-bord/admin/litiges"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            ← Tous les litiges
          </Link>
          <h1 className="mt-1 flex items-center gap-2 text-xl font-bold text-gray-900">
            <AlertTriangle className="h-5 w-5 text-warning-500" />
            Litige #{dispute.id.slice(-8).toUpperCase()}
          </h1>
        </div>
        <Badge variant={sc.variant} className="text-sm">
          {sc.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — thread */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardTitle className="mb-2">Motif du litige</CardTitle>
            <p className="text-sm leading-relaxed text-gray-600">{dispute.reason}</p>
          </Card>

          <Card>
            <CardTitle className="mb-4">Discussion</CardTitle>
            <DisputeThread
              disputeId={dispute.id}
              messages={dispute.messages.map((m) => {
                const roles = m.author.roleAssignments.map((r) => r.role);
                const isStaff = roles.includes("SUPPORT") || roles.includes("ADMIN");
                return {
                  id: m.id,
                  body: m.body,
                  isSystem: m.isSystem,
                  createdAt: m.createdAt.toISOString(),
                  authorId: m.author.id,
                  authorName:
                    m.author.sellerProfile?.displayName ??
                    m.author.buyerProfile?.displayName ??
                    "Support",
                  authorImage: m.author.image,
                  isStaff,
                };
              })}
              canReply={isActive}
              currentUserId={session.user.id}
            />
          </Card>

          {dispute.resolutionNote && (
            <Card>
              <CardTitle className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-success-500" /> Résolution
              </CardTitle>
              <p className="text-sm text-gray-600">{dispute.resolutionNote}</p>
              {dispute.resolvedAt && (
                <p className="mt-2 text-xs text-gray-400">
                  Résolu le{" "}
                  {new Date(dispute.resolvedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Right — info + actions */}
        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-3">Commande</CardTitle>
            <Link
              href={`/services/${order.service.slug}`}
              className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {order.service.title} <ExternalLink className="h-3 w-3" />
            </Link>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Montant</span>
                <span className="font-medium text-gray-900">{formatPrice(order.totalMinor, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Commission</span>
                <span className="text-gray-900">{formatPrice(order.platformFeeMinor, order.currency)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-3">Parties</CardTitle>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Avatar name={buyerName} src={order.buyer.image} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{buyerName}</p>
                  <p className="text-xs text-gray-400">Acheteur</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Avatar name={sellerName} src={order.seller.image} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{sellerName}</p>
                  <p className="text-xs text-gray-400">Vendeur</p>
                </div>
              </div>
            </div>
          </Card>

          {isActive && (
            <Card>
              <CardTitle className="mb-3">Actions</CardTitle>
              <DisputeAdminActions
                disputeId={dispute.id}
                status={dispute.status}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
