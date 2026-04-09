import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/utils";
import { Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientFavorisPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      service: {
        select: {
          id: true,
          slug: true,
          title: true,
          minPriceMinor: true,
          avgRating: true,
          reviewCount: true,
          sellerProfile: { select: { displayName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>

      {favorites.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Heart className="h-8 w-8" />}
            title="Aucun favori"
            description="Ajoutez des services à vos favoris pour les retrouver facilement."
            actionLabel="Parcourir les services"
            actionHref="/services"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {favorites.map((f) => (
            <Link key={f.id} href={`/services/${f.service.slug}`}>
              <Card hover>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{f.service.title}</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      par {f.service.sellerProfile.displayName}
                      {f.service.reviewCount > 0 && (
                        <> · {f.service.avgRating.toFixed(1)} ★ ({f.service.reviewCount} avis)</>
                      )}
                    </p>
                  </div>
                  {f.service.minPriceMinor != null && (
                    <span className="shrink-0 text-sm font-medium text-gray-900">
                      à partir de {formatPrice(f.service.minPriceMinor)}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
