import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Search as SearchIcon } from "lucide-react";
import { searchServices } from "@/lib/search";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ServiceResultCard } from "@/components/search/service-result-card";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchSort } from "@/components/search/search-sort";
import { SearchActiveFilters } from "@/components/search/search-active-filters";
import { SearchPagination } from "@/components/search/search-pagination";
import { MobileFilterToggle } from "@/components/search/mobile-filter-toggle";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const raw = await searchParams;
  const q = raw.q?.trim();
  const title = q ? `Résultats pour « ${q} »` : "Rechercher un service";
  const description = q
    ? `Trouvez les meilleurs services pour « ${q} » sur notre marketplace.`
    : "Parcourez et filtrez des centaines de services professionnels.";
  return { title, description, robots: { index: !q, follow: true } };
}

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function RecherchePage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const t = await getTranslations("Search");

  const result = await searchServices({
    q: raw.q,
    cat: raw.cat,
    priceMin: raw.priceMin ? parseInt(raw.priceMin, 10) : undefined,
    priceMax: raw.priceMax ? parseInt(raw.priceMax, 10) : undefined,
    minRating: raw.minRating ? parseInt(raw.minRating, 10) : undefined,
    maxDelivery: raw.maxDelivery ? parseInt(raw.maxDelivery, 10) : undefined,
    sort: raw.sort,
    page: raw.page ? parseInt(raw.page, 10) : 1,
  });

  const query = raw.q?.trim() ?? "";

  const breadcrumbItems = [
    { label: "Services", href: "/services" },
    ...(raw.cat ? [{ label: raw.cat, href: `/recherche?cat=${raw.cat}` }] : []),
    { label: query || t("defaultTitle") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Breadcrumbs items={breadcrumbItems} />

      <form className="mb-6 flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={t("placeholder")}
            className="h-12 w-full pl-12 pr-4 text-base focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-primary-600 px-6 font-medium text-white transition-colors hover:bg-primary-700"
        >
          {t("button")}
        </button>
      </form>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="hidden w-56 shrink-0 lg:block">
          <SearchFilters
            categories={result.categories}
            priceRange={result.priceRange}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Suspense>
                <MobileFilterToggle>
                  <SearchFilters
                    categories={result.categories}
                    priceRange={result.priceRange}
                  />
                </MobileFilterToggle>
              </Suspense>

              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{result.total}</span>{" "}
                {t("resultCount", { count: result.total })}
                {query && (
                  <>
                    {" "}{t("forQuery")}{" "}
                    <span className="font-medium text-gray-700">« {query} »</span>
                  </>
                )}
              </p>
            </div>

            <Suspense>
              <SearchSort />
            </Suspense>
          </div>

          <Suspense>
            <SearchActiveFilters />
          </Suspense>

          {result.services.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon={<SearchIcon className="h-8 w-8" />}
                title={t("noResults")}
                description={t("noResultsDesc")}
                actionLabel={t("reset")}
                actionHref="/recherche"
              />
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.services.map((s) => (
                  <ServiceResultCard key={s.id} service={s} />
                ))}
              </div>

              <div className="mt-8">
                <Suspense>
                  <SearchPagination page={result.page} totalPages={result.totalPages} />
                </Suspense>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
