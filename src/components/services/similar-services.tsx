import Link from "next/link";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/utils";
import { getSimilarServices } from "@/lib/recommendation-actions";

interface Props {
  serviceId: string;
  categoryId: string;
}

export async function SimilarServices({ serviceId, categoryId }: Props) {
  const services = await getSimilarServices(serviceId, categoryId);

  if (services.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Services similaires
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => {
          const price = s.packages[0]?.priceMinor ?? s.minPriceMinor;
          const currency = s.packages[0]?.currency ?? "XOF";
          return (
            <Link key={s.id} href={`/services/${s.slug}`}>
              <Card hover className="h-full">
                <div className="mb-3 flex items-center gap-2">
                  <Avatar
                    name={s.sellerProfile.displayName}
                    src={s.sellerProfile.user.image}
                    size="sm"
                    verified={s.sellerProfile.verifiedBadge}
                  />
                  <span className="truncate text-xs text-gray-500">
                    {s.sellerProfile.displayName}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
                  {s.title}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  {s.reviewCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
                      {s.avgRating.toFixed(1)} ({s.reviewCount})
                    </span>
                  )}
                </div>
                {price && (
                  <p className="mt-2 text-sm font-bold text-gray-900">
                    À partir de {formatPrice(price, currency)}
                  </p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
