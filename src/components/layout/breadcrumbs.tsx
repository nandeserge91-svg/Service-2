import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-4 overflow-x-auto">
      <ol className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:text-gray-900"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Accueil</span>
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
              {isLast || !item.href ? (
                <span className="rounded px-1 py-0.5 font-medium text-gray-900 truncate max-w-[200px]">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="rounded px-1 py-0.5 transition-colors hover:text-gray-900 truncate max-w-[200px]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
