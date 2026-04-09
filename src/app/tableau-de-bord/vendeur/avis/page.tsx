import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SellerAvisPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!seller) return null;

  const reviews = await prisma.review.findMany({
    where: { order: { sellerUserId: session.user.id } },
    include: {
      order: {
        select: {
          service: { select: { title: true } },
          buyer: { select: { buyerProfile: { select: { displayName: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Avis reçus</h1>
        {avgRating && (
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-warning-500" fill="currentColor" />
            <span className="text-lg font-bold text-gray-900">{avgRating}</span>
            <span className="text-sm text-gray-500">({reviews.length} avis)</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Star className="h-8 w-8" />}
            title="Aucun avis"
            description="Les avis de vos clients apparaîtront ici après chaque commande terminée."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {r.order.buyer.buyerProfile?.displayName ?? "Client"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {r.order.service.title} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < r.rating ? "text-warning-500" : "text-gray-200"}`}
                      fill={i < r.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
              </div>
              {r.comment && (
                <p className="mt-2 text-sm text-gray-700">{r.comment}</p>
              )}
              {r.sellerResponse && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <Badge variant="default" className="mb-1">Votre réponse</Badge>
                  <p className="text-sm text-gray-700">{r.sellerResponse}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
