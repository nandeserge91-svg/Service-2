import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { OrderActions } from "@/components/orders/order-actions";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { ReviewCard } from "@/components/reviews/review-card";
import { SellerResponseForm } from "@/components/reviews/seller-response-form";
import { Clock, ExternalLink, Star } from "lucide-react";

export default async function SellerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const order = await prisma.order.findFirst({
    where: { id, sellerUserId: session.user.id },
    include: {
      service: { select: { title: true, slug: true } },
      servicePackage: { select: { title: true, deliveryDays: true, revisions: true } },
      offer: { select: { title: true, deliveryDays: true, revisions: true } },
      buyer: {
        select: {
          image: true,
          buyerProfile: { select: { displayName: true } },
        },
      },
      events: { orderBy: { createdAt: "asc" } },
      reviews: {
        include: {
          order: {
            select: {
              buyer: {
                select: {
                  buyerProfile: { select: { displayName: true } },
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) notFound();

  const review = order.reviews[0] ?? null;

  const sc = ORDER_STATUS_COLORS[order.status] ?? ORDER_STATUS_COLORS.PENDING_PAYMENT;
  const buyerName = order.buyer.buyerProfile?.displayName ?? "Client";
  const pkgOrOffer = order.servicePackage ?? order.offer;
  const sellerPayout = order.subtotalMinor;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/tableau-de-bord/vendeur/commandes" className="text-sm text-primary-600 hover:text-primary-700">
            ← Mes commandes
          </Link>
          <h1 className="mt-1 text-xl font-bold text-gray-900">
            Commande #{order.id.slice(-8).toUpperCase()}
          </h1>
        </div>
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${sc.bg} ${sc.text}`}>
          <span className={`h-2 w-2 rounded-full ${sc.dot}`} />
          {ORDER_STATUS_LABELS[order.status]}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="flex items-center gap-3">
              <Avatar name={buyerName} src={order.buyer.image} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{buyerName}</p>
                <Link
                  href={`/services/${order.service.slug}`}
                  className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  {order.service.title} <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
            {pkgOrOffer && (
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                <Badge variant="default">{pkgOrOffer.title}</Badge>
                {pkgOrOffer.deliveryDays && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {pkgOrOffer.deliveryDays}j
                  </span>
                )}
              </div>
            )}
            {order.brief && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500">Brief du client</p>
                <p className="mt-1 text-sm text-gray-700">{order.brief}</p>
              </div>
            )}
          </Card>

          <Card>
            <CardTitle className="mb-4">Historique</CardTitle>
            <OrderTimeline events={order.events} />
          </Card>

          {/* Review from buyer */}
          {review && (
            <Card>
              <CardTitle className="mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-warning-400" /> Avis du client
              </CardTitle>
              <ReviewCard
                rating={review.rating}
                comment={review.comment}
                buyerName={review.order.buyer.buyerProfile?.displayName ?? "Client"}
                buyerImage={review.order.buyer.image}
                createdAt={review.createdAt.toISOString()}
                sellerResponse={review.sellerResponse}
                sellerRespondedAt={review.sellerRespondedAt?.toISOString()}
              />
              {!review.sellerResponse && (
                <div className="mt-3">
                  <SellerResponseForm reviewId={review.id} />
                </div>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-3">Vos revenus</CardTitle>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total commande</span>
                <span className="text-gray-900">{formatPrice(order.totalMinor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Commission plateforme</span>
                <span className="text-danger-600">-{formatPrice(order.platformFeeMinor)}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between font-semibold">
                <span className="text-gray-900">Votre paiement</span>
                <span className="text-success-700">{formatPrice(sellerPayout)}</span>
              </div>
            </div>
            {order.deliveryDueAt && (
              <p className="mt-3 text-xs text-gray-400">
                À livrer avant le{" "}
                {new Date(order.deliveryDueAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}
              </p>
            )}
          </Card>

          <Card>
            <OrderActions orderId={order.id} status={order.status} role="seller" />
          </Card>
        </div>
      </div>
    </div>
  );
}
