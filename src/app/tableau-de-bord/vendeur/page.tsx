import { auth } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import {
  Wallet, ShoppingBag, Star, Clock, Plus, ArrowRight, CheckCircle2, Circle,
} from "lucide-react";

export const dynamic = "force-dynamic";

import type { OrderStatus } from "@prisma/client";

const ACTIVE_STATUSES: OrderStatus[] = ["IN_PROGRESS", "DELIVERED", "REVISION_REQUESTED"];

export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, displayName: true, bio: true },
  });

  const [wallet, activeCount, avgRev, publishedCount, recentServices] = await Promise.all([
    seller
      ? prisma.financialWallet.findUnique({
          where: { sellerProfileId_currency: { sellerProfileId: seller.id, currency: "XOF" } },
        })
      : null,
    prisma.order.count({
      where: { sellerUserId: session.user.id, status: { in: ACTIVE_STATUSES } },
    }),
    prisma.review.aggregate({
      where: { order: { sellerUserId: session.user.id } },
      _avg: { rating: true },
      _count: true,
    }),
    prisma.service.count({
      where: { sellerProfileId: seller?.id ?? "__none__", status: "PUBLISHED" },
    }),
    prisma.service.findMany({
      where: { sellerProfileId: seller?.id ?? "__none__" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, title: true, status: true,
        _count: { select: { orders: true } },
      },
    }),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const monthRevenue = await prisma.order.aggregate({
    where: {
      sellerUserId: session.user.id,
      status: "COMPLETED",
      completedAt: { gte: monthStart },
    },
    _sum: { subtotalMinor: true },
  });

  const onTimeOrders = await prisma.order.findMany({
    where: { sellerUserId: session.user.id, status: "COMPLETED" },
    select: { deliveryDueAt: true, completedAt: true },
    take: 100,
    orderBy: { completedAt: "desc" },
  });
  let onTimeRate: string | null = null;
  if (onTimeOrders.length > 0) {
    const onTime = onTimeOrders.filter(
      (o) => !o.deliveryDueAt || !o.completedAt || o.completedAt <= o.deliveryDueAt,
    ).length;
    onTimeRate = `${Math.round((onTime / onTimeOrders.length) * 100)} %`;
  }

  const profileDone = !!(seller?.displayName && seller?.bio);
  const hasPublished = publishedCount > 0;

  const steps = [
    { done: true, label: "Compte créé" },
    { done: profileDone, label: "Compléter le profil", href: "/tableau-de-bord/vendeur/profil" },
    { done: hasPublished, label: "Publier un service", href: "/tableau-de-bord/vendeur/services/nouveau" },
  ];
  const allDone = steps.every((s) => s.done);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenue, {session.user.name?.split(" ")[0] ?? "vendeur"} !
        </h1>
        <Link href="/tableau-de-bord/vendeur/services/nouveau">
          <Button icon={<Plus className="h-4 w-4" />}>Nouveau service</Button>
        </Link>
      </div>

      {!allDone && (
        <Card className="border-primary-200 bg-primary-50">
          <p className="mb-3 text-sm font-semibold text-primary-800">
            Complétez votre profil pour attirer plus de clients
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 text-success-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(monthRevenue._sum.subtotalMinor ?? BigInt(0))}
              </p>
              <p className="text-sm text-gray-500">Revenus ce mois</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-sm text-gray-500">Commandes actives</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50 text-warning-500">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {avgRev._avg.rating ? avgRev._avg.rating.toFixed(1) : "—"}
              </p>
              <p className="text-sm text-gray-500">
                Note moyenne{avgRev._count > 0 ? ` (${avgRev._count})` : ""}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{onTimeRate ?? "—"}</p>
              <p className="text-sm text-gray-500">Taux à temps</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <CardTitle>Mes services</CardTitle>
          <Link
            href="/tableau-de-bord/vendeur/services"
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            Tout voir <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recentServices.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="mb-3 text-sm text-gray-500">
              Publiez votre premier service pour commencer à recevoir des commandes.
            </p>
            <Link href="/tableau-de-bord/vendeur/services/nouveau">
              <Button variant="outline" icon={<Plus className="h-4 w-4" />}>Créer un service</Button>
            </Link>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {recentServices.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="truncate font-medium text-gray-900">{s.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{s._count.orders} cmd.</span>
                  <Badge variant={s.status === "PUBLISHED" ? "success" : "default"}>
                    {s.status === "PUBLISHED" ? "Publié" : s.status === "DRAFT" ? "Brouillon" : "Archivé"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
