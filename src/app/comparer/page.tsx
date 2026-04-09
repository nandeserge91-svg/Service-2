import type { Metadata } from "next";
import Link from "next/link";
import { Star, Clock, RefreshCw, MapPin, ShieldCheck, ShoppingBag, Heart } from "lucide-react";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { getServicesForComparison } from "@/lib/recommendation-actions";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comparer des services",
  description: "Comparez les services côte à côte pour trouver le meilleur prestataire.",
};

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { ids: idsParam } = await searchParams;
  const ids = idsParam?.split(",").filter(Boolean) ?? [];

  let services: Awaited<ReturnType<typeof getServicesForComparison>> = [];

  if (ids.length > 0 && hasDatabaseUrl()) {
    try {
      services = await getServicesForComparison(ids);
    } catch {
      /* DB unavailable */
    }
  }

  if (services.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <Breadcrumbs items={[{ label: "Comparer" }]} />
        <div className="py-16 text-center">
          <h1 className="text-xl font-bold text-gray-900">Comparer des services</h1>
          <p className="mt-3 text-sm text-gray-500">
            Ajoutez des services a comparer en utilisant le paramètre <code>?ids=id1,id2,id3</code>
            {" "}ou via les fiches services.
          </p>
          <Link
            href="/services"
            className="mt-6 inline-block rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Parcourir les services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs items={[{ label: "Services", href: "/services" }, { label: "Comparer" }]} />

      <h1 className="mb-8 text-xl font-bold text-gray-900">
        Comparaison ({services.length} service{services.length > 1 ? "s" : ""})
      </h1>

      <div className="overflow-x-auto">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${services.length}, minmax(280px, 1fr))` }}
        >
          {services.map((s) => {
            const seller = s.sellerProfile;
            const pkg = s.packages[0];
            return (
              <Card key={s.id} className="flex flex-col">
                {/* Service header */}
                <div className="mb-4 flex items-center gap-3">
                  <Avatar
                    name={seller.displayName}
                    src={seller.user.image}
                    size="md"
                    verified={seller.verifiedBadge}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {seller.displayName}
                    </p>
                    {seller.city && (
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" /> {seller.city}
                      </p>
                    )}
                  </div>
                </div>

                <Link href={`/services/${s.slug}`}>
                  <h3 className="text-base font-bold text-gray-900 hover:text-primary-600">
                    {s.title}
                  </h3>
                </Link>

                <Badge variant="default" className="mt-2 self-start">
                  {s.category.nameFr}
                </Badge>

                {/* Stats */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Star className="h-4 w-4 text-warning-400" /> Note
                    </span>
                    <span className="font-medium text-gray-900">
                      {s.avgRating > 0 ? `${s.avgRating.toFixed(1)} (${s.reviewCount})` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-gray-500">
                      <ShoppingBag className="h-4 w-4" /> Commandes
                    </span>
                    <span className="font-medium text-gray-900">{s._count.orders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Heart className="h-4 w-4" /> Favoris
                    </span>
                    <span className="font-medium text-gray-900">{s._count.favorites}</span>
                  </div>
                </div>

                {/* Packages */}
                <div className="mt-4 flex-1 space-y-3 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Packages
                  </p>
                  {s.packages.map((p) => (
                    <div key={p.id} className="rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="primary" className="text-[10px]">{p.tier}</Badge>
                        <span className="font-bold text-gray-900">
                          {formatPrice(p.priceMinor, p.currency)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-gray-700">{p.title}</p>
                      <div className="mt-1 flex gap-3 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {p.deliveryDays}j
                        </span>
                        <span className="flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" /> {p.revisions} rév.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-xs text-success-700">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  Escrow protégé
                </div>

                <Link
                  href={`/services/${s.slug}`}
                  className="mt-4 block rounded-lg bg-primary-600 py-2 text-center text-sm font-medium text-white transition hover:bg-primary-700"
                >
                  Voir le service
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
