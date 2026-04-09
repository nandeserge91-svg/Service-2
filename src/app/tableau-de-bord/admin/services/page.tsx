import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ServiceAdminActions } from "@/components/admin/service-admin-actions";
import { Store, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, { label: string; variant: "warning" | "success" | "default" }> = {
  DRAFT: { label: "Brouillon", variant: "warning" },
  PUBLISHED: { label: "Publié", variant: "success" },
  ARCHIVED: { label: "Archivé", variant: "default" },
};

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      sellerProfile: {
        select: { displayName: true, user: { select: { image: true } } },
      },
      category: { select: { nameFr: true } },
      packages: { take: 1, orderBy: { sortOrder: "asc" }, select: { priceMinor: true, currency: true } },
      _count: { select: { orders: true } },
    },
  });

  const draftCount = services.filter((s) => s.status === "DRAFT").length;
  const publishedCount = services.filter((s) => s.status === "PUBLISHED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Modération des services</h1>
        <p className="mt-1 text-sm text-gray-500">
          {draftCount} en brouillon · {publishedCount} publiés · {services.length} total
        </p>
      </div>

      <Card padding="none">
        {services.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Store className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">Aucun service</p>
          </div>
        )}

        {services.map((s) => {
          const cfg = STATUS_MAP[s.status] ?? STATUS_MAP.DRAFT;
          const price = s.packages[0];
          return (
            <div
              key={s.id}
              className="flex items-center gap-4 border-b border-gray-50 px-5 py-4 last:border-b-0"
            >
              <Avatar
                name={s.sellerProfile.displayName}
                src={s.sellerProfile.user.image}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-gray-900">{s.title}</p>
                  <Link href={`/services/${s.slug}`} target="_blank">
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  </Link>
                </div>
                <p className="text-xs text-gray-400">
                  {s.sellerProfile.displayName} · {s.category.nameFr} ·{" "}
                  {s._count.orders} commande{s._count.orders > 1 ? "s" : ""}
                  {price && ` · ${formatPrice(price.priceMinor, price.currency)}`}
                </p>
              </div>
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
              <ServiceAdminActions serviceId={s.id} status={s.status} />
            </div>
          );
        })}
      </Card>
    </div>
  );
}
