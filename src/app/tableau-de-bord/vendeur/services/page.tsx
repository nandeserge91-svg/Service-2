import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/utils";

const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "default" }> = {
  PUBLISHED: { label: "Publié", variant: "success" },
  DRAFT: { label: "Brouillon", variant: "warning" },
  ARCHIVED: { label: "Archivé", variant: "default" },
};

export default async function SellerServicesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const services = await prisma.service.findMany({
    where: { sellerProfile: { userId: session.user.id } },
    include: {
      category: true,
      packages: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { orders: true, favorites: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Mes services</h1>
        <Link href="/tableau-de-bord/vendeur/services/nouveau">
          <Button icon={<Plus className="h-4 w-4" />}>Nouveau service</Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <Card>
          <EmptyState
            title="Aucun service"
            description="Publiez votre premier service pour commencer à recevoir des commandes."
            actionLabel="Créer un service"
            actionHref="/tableau-de-bord/vendeur/services/nouveau"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {services.map((s) => {
            const st = statusLabels[s.status] ?? statusLabels.DRAFT;
            const minPrice = s.packages[0]?.priceMinor;
            return (
              <Link
                key={s.id}
                href={`/tableau-de-bord/vendeur/services/${s.id}/modifier`}
              >
                <Card hover className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-gray-900">
                        {s.title}
                      </p>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {s.category.nameFr}
                      {minPrice != null && ` · À partir de ${formatPrice(minPrice)}`}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>{s._count.orders} commandes</span>
                    <span>{s._count.favorites} favoris</span>
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
