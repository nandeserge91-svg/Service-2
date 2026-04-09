"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";

const LABELS: Record<string, (v: string) => string> = {
  cat: (v) => `Catégorie: ${v}`,
  priceMin: (v) => `Min: ${Number(v).toLocaleString("fr-FR")} F`,
  priceMax: (v) => `Max: ${Number(v).toLocaleString("fr-FR")} F`,
  minRating: (v) => `${v}★ et plus`,
  maxDelivery: (v) => `≤ ${v} jour${Number(v) > 1 ? "s" : ""}`,
};

const FILTER_KEYS = ["cat", "priceMin", "priceMax", "minRating", "maxDelivery"];

export function SearchActiveFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const active = FILTER_KEYS.filter((k) => searchParams.has(k)).map((k) => ({
    key: k,
    value: searchParams.get(k)!,
    label: LABELS[k]?.(searchParams.get(k)!) ?? `${k}: ${searchParams.get(k)}`,
  }));

  if (active.length === 0) return null;

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    startTransition(() => {
      router.push(`/recherche?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-400">Filtres :</span>
      {active.map((f) => (
        <button
          key={f.key}
          onClick={() => removeFilter(f.key)}
          className="group flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100"
        >
          {f.label}
          <X className="h-3 w-3 opacity-50 group-hover:opacity-100" />
        </button>
      ))}
    </div>
  );
}
