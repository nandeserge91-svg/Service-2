import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import {
  ShoppingBag, MessageCircle, Clock, CheckCircle2, Circle, ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

import type { OrderStatus } from "@prisma/client";

const ACTION_STATUSES: OrderStatus[] = ["DELIVERED", "REVISION_REQUESTED"];
const ACTIVE_STATUSES: OrderStatus[] = ["IN_PROGRESS", "DELIVERED", "REVISION_REQUESTED", "PENDING_PAYMENT"];

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [activeOrders, actionRequired, unreadMessages, recentOrders, hasFavorites, hasProfile] =
    await Promise.all([
      prisma.order.count({
        where: { buyerUserId: session.user.id, status: { in: ACTIVE_STATUSES } },
      }),
      prisma.order.count({
        where: { buyerUserId: session.user.id, status: { in: ACTION_STATUSES } },
      }),
      prisma.conversationParticipant.count({
        where: {
          userId: session.user.id,
          conversation: {
            messages: {
              some: {
                authorId: { not: session.user.id },
                createdAt: { gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
              },
            },
          },
          OR: [
            { lastReadAt: null },
            {
              lastReadAt: {
                lt: new Date(Date.now() - 60 * 1000),
              },
            },
          ],
        },
      }),
      prisma.order.findMany({
        where: { buyerUserId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          service: { select: { title: true } },
          seller: { select: { sellerProfile: { select: { displayName: true } } } },
        },
      }),
      prisma.favorite.count({ where: { userId: session.user.id } }).then((c) => c > 0),
      prisma.buyerProfile
        .findUnique({ where: { userId: session.user.id }, select: { displayName: true } })
        .then((p) => !!p?.displayName),
    ]);

  const steps = [
    { done: true, label: "Compte créé" },
    { done: hasProfile, label: "Compléter le profil", href: "/tableau-de-bord/client/profil" },
    { done: recentOrders.length > 0, label: "Passer une commande", href: "/services" },
    { done: hasFavorites, label: "Ajouter un favori", href: "/services" },
  ];
  const allDone = steps.every((s) => s.done);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Bonjour, {session.user.name?.split(" ")[0] ?? "vous"} !
      </h1>

      {!allDone && (
        <Card className="border-primary-200 bg-primary-50">
          <p className="mb-3 text-sm font-semibold text-primary-800">
            Premiers pas sur la plateforme
          </p>
          <div className="flex flex-wrap gap-2">
            {steps.map((s) =>
              s.done ? (
                <Badge key={s.label} variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {s.label}
                </Badge>
              ) : (
                <Link key={s.label} href={s.href!}>
                  <Badge variant="default" className="flex cursor-pointer items-center gap-1 hover:bg-gray-200">
                    <Circle className="h-3 w-3" /> {s.label}
                  </Badge>
                </Link>
              ),
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeOrders}</p>
              <p className="text-sm text-gray-500">Commandes actives</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 text-success-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{unreadMessages}</p>
              <p className="text-sm text-gray-500">Messages non lus</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{actionRequired}</p>
              <p className="text-sm text-gray-500">Actions requises</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <CardTitle>Commandes récentes</CardTitle>
          {recentOrders.length > 0 && (
            <Link
              href="/tableau-de-bord/client/commandes"
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
            >
              Tout voir <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {recentOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-8 w-8" />}
            title="Pas encore de commande"
            description="Trouvez un service qui correspond à votre besoin et passez votre première commande."
            actionLabel="Parcourir les services"
            actionHref="/services"
          />
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {recentOrders.map((o) => {
              const sc = ORDER_STATUS_COLORS[o.status] ?? ORDER_STATUS_COLORS.PENDING_PAYMENT;
              return (
                <li key={o.id}>
                  <Link
                    href={`/tableau-de-bord/client/commandes/${o.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{o.service.title}</p>
                      <p className="text-xs text-gray-400">
                        {o.seller.sellerProfile?.displayName ?? "Vendeur"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">{formatPrice(o.totalMinor)}</span>
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sc.bg} ${sc.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        {ORDER_STATUS_LABELS[o.status]}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
