"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_SEARCHES = [
  "Design graphique",
  "Développement web",
  "Rédaction",
  "Traduction",
  "Marketing digital",
  "Montage vidéo",
];

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showDropdown = focused && !query.trim();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submit = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      setFocused(false);
      router.push(`/recherche?q=${encodeURIComponent(trimmed)}`);
    },
    [router],
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="relative"
      >
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Rechercher un service…"
          className={cn(
            "h-10 w-full rounded-lg border bg-gray-50 pl-10 pr-10 text-sm transition-all placeholder:text-gray-400 focus:bg-white focus:outline-none",
            focused
              ? "border-primary-500 ring-2 ring-primary-500/20"
              : "border-gray-300",
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
          <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Recherches populaires
          </p>
          {POPULAR_SEARCHES.map((s) => (
            <button
              key={s}
              onMouseDown={(e) => {
                e.preventDefault();
                setQuery(s);
                submit(s);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
