import Link from "next/link";
import { Star, Clock, ShoppingBag, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/utils";
import type { ServiceHit } from "@/lib/search";

export function ServiceResultCard({ service }: { service: ServiceHit }) {
  const s = service;
  return (
    <Link
      href={`/services/${s.slug}`}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <Card
        hover
        padding="none"
        className="flex h-full flex-col overflow-hidden transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
      >
        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary-50 via-gray-50 to-gray-100">
          <span className="text-4xl text-gray-200">🖼️</span>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <div className="flex items-center gap-2">
            <Avatar name={s.sellerName} src={s.sellerImage} size="sm" verified={s.sellerVerified} />
            <span className="truncate text-sm font-medium text-gray-700">{s.sellerName}</span>
            {s.sellerVerified && <CheckCircle className="h-3.5 w-3.5 shrink-0 text-primary-500" />}
          </div>

          <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-900">
            {s.title}
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {s.reviewCount > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
                <span className="font-medium text-gray-700">{s.avgRating.toFixed(1)}</span>
                <span>({s.reviewCount})</span>
              </span>
            )}
            {s.minDeliveryDays != null && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {s.minDeliveryDays}j
              </span>
            )}
            {s.orderCount > 0 && (
              <span className="flex items-center gap-1">
                <ShoppingBag className="h-3.5 w-3.5" />
                {s.orderCount}
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-2.5">
            <span className="text-xs text-gray-400">{s.categoryName}</span>
            {s.minPriceMinor != null && (
              <span className="text-sm text-gray-500">
                À partir de{" "}
                <span className="font-semibold text-gray-900">
                  {formatPrice(s.minPriceMinor, s.currency)}
                </span>
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
