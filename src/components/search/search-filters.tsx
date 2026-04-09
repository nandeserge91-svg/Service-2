"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryFacet } from "@/lib/search";

interface Props {
  categories: CategoryFacet[];
  priceRange: { min: number; max: number };
}

const DELIVERY_OPTIONS = [
  { label: "24h", value: 1 },
  { label: "3 jours", value: 3 },
  { label: "7 jours", value: 7 },
  { label: "14 jours", value: 14 },
  { label: "30 jours", value: 30 },
];

const RATING_OPTIONS = [4, 3, 2, 1];

export function SearchFilters({ categories, priceRange }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const activeCat = searchParams.get("cat") ?? "";
  const activeMinRating = parseInt(searchParams.get("minRating") ?? "0", 10);
  const activeMaxDelivery = parseInt(searchParams.get("maxDelivery") ?? "0", 10);
  const activePriceMin = searchParams.get("priceMin") ?? "";
  const activePriceMax = searchParams.get("priceMax") ?? "";

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/recherche?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition],
  );

  const hasFilters = activeCat || activeMinRating || activeMaxDelivery || activePriceMin || activePriceMax;

  return (
    <aside className="space-y-6">
      {hasFilters && (
        <button
          onClick={() => {
            const params = new URLSearchParams();
            const q = searchParams.get("q");
            if (q) params.set("q", q);
            startTransition(() => {
              router.push(`/recherche?${params.toString()}`);
            });
          }}
          className="flex items-center gap-1 text-xs font-medium text-danger-600 hover:underline"
        >
          <X className="h-3 w-3" /> Effacer les filtres
        </button>
      )}

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Catégorie
        </h3>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => setParam("cat", "")}
            className={cn(
              "rounded-lg px-3 py-2 text-left text-sm transition-colors",
              !activeCat
                ? "bg-primary-50 font-medium text-primary-700"
                : "text-gray-600 hover:bg-gray-50",
            )}
          >
            Toutes
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setParam("cat", c.slug)}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                activeCat === c.slug
                  ? "bg-primary-50 font-medium text-primary-700"
                  : "text-gray-600 hover:bg-gray-50",
              )}
            >
              <span>{c.nameFr}</span>
              <span className="text-xs text-gray-400">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Budget (FCFA)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={`${priceRange.min}`}
            defaultValue={activePriceMin}
            onBlur={(e) => setParam("priceMin", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setParam("priceMin", e.currentTarget.value);
            }}
            className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 focus:outline-none"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            placeholder={`${priceRange.max}`}
            defaultValue={activePriceMax}
            onBlur={(e) => setParam("priceMax", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setParam("priceMax", e.currentTarget.value);
            }}
            className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Note minimum
        </h3>
        <div className="flex flex-col gap-1">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setParam("minRating", activeMinRating === r ? "" : String(r))}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                activeMinRating === r
                  ? "bg-primary-50 font-medium text-primary-700"
                  : "text-gray-600 hover:bg-gray-50",
              )}
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < r ? "fill-warning-400 text-warning-400" : "text-gray-200",
                    )}
                  />
                ))}
              </div>
              <span>& plus</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Délai de livraison
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {DELIVERY_OPTIONS.map((d) => (
            <button
              key={d.value}
              onClick={() =>
                setParam("maxDelivery", activeMaxDelivery === d.value ? "" : String(d.value))
              }
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                activeMaxDelivery === d.value
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
