export const dynamic = "force-dynamic";

import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/utils";
import { CATEGORIES_ICONS } from "@/lib/constants";

type CategoryWithChildren = Prisma.CategoryGetPayload<{
  include: { children: { orderBy: { sortOrder: "asc" } } };
}>;

type FeaturedServiceRow = Prisma.ServiceGetPayload<{
  include: {
    sellerProfile: { select: { displayName: true; verifiedBadge: true } };
    packages: { orderBy: { priceMinor: "asc" }; take: 1 };
    category: { select: { nameFr: true } };
  };
}>;

export default async function ServicesPage() {
  let categories: CategoryWithChildren[] = [];
  let featuredServices: FeaturedServiceRow[] = [];

  if (hasDatabaseUrl()) {
    try {
      categories = await prisma.category.findMany({
        where: { parentId: null },
        include: { children: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      });
      featuredServices = await prisma.service.findMany({
        where: { status: "PUBLISHED" },
        include: {
          sellerProfile: { select: { displayName: true, verifiedBadge: true } },
          packages: { orderBy: { priceMinor: "asc" }, take: 1 },
          category: { select: { nameFr: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      });
    } catch {
      /* DB indisponible (ex. next build sans Postgres) */
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Parcourir les services
      </h1>

      {/* Categories */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Catégories</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/recherche?cat=${cat.slug}`}>
              <Card hover className="flex items-center gap-3 text-center">
                <span className="text-2xl">
                  {CATEGORIES_ICONS[cat.slug] ?? "📁"}
                </span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{cat.nameFr}</p>
                  <p className="text-xs text-gray-500">
                    {cat.children.length} sous-catégories
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent services */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Services récents
          </h2>
          <Link
            href="/recherche"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Tout voir →
          </Link>
        </div>

        {featuredServices.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Aucun service publié pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredServices.map((s) => {
              const minPrice = s.packages[0]?.priceMinor;
              return (
                <Link key={s.id} href={`/services/${s.slug}`}>
                  <Card hover padding="none" className="overflow-hidden">
                    <div className="flex h-32 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50 text-3xl text-gray-300">
                      🖼️
                    </div>
                    <div className="space-y-2 p-4">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={s.sellerProfile.displayName}
                          size="sm"
                          verified={s.sellerProfile.verifiedBadge}
                        />
                        <span className="truncate text-sm text-gray-600">
                          {s.sellerProfile.displayName}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm font-medium text-gray-900">
                        {s.title}
                      </p>
                      {minPrice != null && (
                        <p className="text-sm text-gray-500">
                          À partir de{" "}
                          <span className="font-semibold text-gray-900">
                            {formatPrice(minPrice)}
                          </span>
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
