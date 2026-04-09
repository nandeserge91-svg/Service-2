import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/utils";
import {
  Wallet, ArrowDownToLine, Clock, TrendingUp, Lock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SellerRevenusPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!seller) return null;

  const wallet = await prisma.financialWallet.findUnique({
    where: {
      sellerProfileId_currency: { sellerProfileId: seller.id, currency: "XOF" },
    },
  });

  const available = wallet?.availableMinor ?? BigInt(0);
  const pending = wallet?.pendingMinor ?? BigInt(0);

  const completedOrders = await prisma.order.findMany({
    where: { sellerUserId: session.user.id, status: "COMPLETED" },
    include: { service: { select: { title: true } } },
    orderBy: { completedAt: "desc" },
    take: 20,
  });

  const activeEscrows = await prisma.escrowState.findMany({
    where: {
      order: { sellerUserId: session.user.id },
      status: "HELD",
    },
    include: {
      order: {
        select: { id: true, subtotalMinor: true, service: { select: { title: true } } },
      },
    },
  });

  const totalEscrow = activeEscrows.reduce(
    (sum, e) => sum + (e.order.subtotalMinor ?? BigInt(0)),
    BigInt(0),
  );

  const totalEarned = completedOrders.reduce(
    (sum, o) => sum + o.subtotalMinor,
    BigInt(0),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Revenus</h1>
        <Link href="/tableau-de-bord/vendeur/retraits">
          <Button variant="outline" icon={<ArrowDownToLine className="h-4 w-4" />}>
            Demander un retrait
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 text-success-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(available)}
              </p>
              <p className="text-sm text-gray-500">Disponible</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(totalEscrow)}
              </p>
              <p className="text-sm text-gray-500">En séquestre</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(totalEarned)}
              </p>
              <p className="text-sm text-gray-500">Total gagné</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(pending)}
              </p>
              <p className="text-sm text-gray-500">En attente retrait</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active escrows */}
      {activeEscrows.length > 0 && (
        <Card>
          <CardTitle className="mb-3">Fonds en séquestre</CardTitle>
          <p className="mb-3 text-xs text-gray-400">
            Ces fonds seront disponibles dès que le client accepte la livraison.
          </p>
          <div className="divide-y divide-gray-100">
            {activeEscrows.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {e.order.service.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    #{e.order.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(e.order.subtotalMinor)}
                  </span>
                  <Badge variant="warning">Séquestre</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Completed orders history */}
      <Card>
        <CardTitle className="mb-3">Commandes terminées</CardTitle>
        {completedOrders.length === 0 ? (
          <EmptyState
            icon={<TrendingUp className="h-8 w-8" />}
            title="Pas encore de revenus"
            description="Terminez des commandes pour voir vos revenus ici."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {completedOrders.map((o) => (
              <Link
                key={o.id}
                href={`/tableau-de-bord/vendeur/commandes/${o.id}`}
                className="flex items-center justify-between py-2.5 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {o.service.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {o.completedAt
                      ? new Date(o.completedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-success-700">
                  +{formatPrice(o.subtotalMinor)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
