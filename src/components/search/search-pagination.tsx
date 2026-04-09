"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  totalPages: number;
}

export function SearchPagination({ page, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) {
      params.set("page", String(p));
    } else {
      params.delete("page");
    }
    startTransition(() => {
      router.push(`/recherche?${params.toString()}`);
    });
  }

  const pages = buildPageRange(page, totalPages);

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", isPending && "opacity-50")}
      aria-label="Pagination"
    >
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === null ? (
          <span key={`dots-${i}`} className="px-1 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goToPage(p)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
              p === page
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-100",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function buildPageRange(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | null)[] = [1];

  if (current > 3) pages.push(null);

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push(null);

  pages.push(total);
  return pages;
}
