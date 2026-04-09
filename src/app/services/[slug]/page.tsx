import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star, Clock, RefreshCw, MapPin, MessageCircle, ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { contactSeller } from "@/lib/messaging-actions";
import { createOrderFromPackage } from "@/lib/order-actions";
import { getSellerReputation } from "@/lib/review-actions";
import { serviceJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StarRating } from "@/components/reviews/star-rating";
import { ReviewCard } from "@/components/reviews/review-card";
import { ReputationSummary } from "@/components/reviews/reputation-summary";
import { formatPrice } from "@/lib/utils";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.service.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      title: true,
      summary: true,
      avgRating: true,
      reviewCount: true,
      minPriceMinor: true,
      sellerProfile: { select: { displayName: true } },
      category: { select: { nameFr: true } },
    },
  });

  if (!service) return { title: "Service introuvable" };

  const description =
    service.summary?.slice(0, 160) ??
    `${service.title} par ${service.sellerProfile.displayName}`;

  return {
    title: service.title,
    description,
    openGraph: {
      title: `${service.title} — ${service.sellerProfile.displayName}`,
      description,
      url: `${siteUrl}/services/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: service.title,
      description,
    },
    alternates: { canonical: `${siteUrl}/services/${slug}` },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const service = await prisma.service.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      sellerProfile: {
        include: {
          user: { select: { image: true, createdAt: true } },
        },
      },
      category: { include: { parent: true } },
      packages: { orderBy: { sortOrder: "asc" } },
      extras: true,
      faqItems: { orderBy: { sortOrder: "asc" } },
      _count: { select: { orders: true } },
    },
  });

  if (!service) notFound();

  const reviews = await prisma.review.findMany({
    where: { order: { serviceId: service.id } },
    orderBy: { createdAt: "desc" },
    take: 5,
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
  });

  const seller = service.sellerProfile;
  const reputation = await getSellerReputation(seller.userId);

  const jsonLdService = serviceJsonLd({
    title: service.title,
    description: service.summary ?? service.title,
    slug: service.slug,
    sellerName: seller.displayName,
    avgRating: service.avgRating,
    reviewCount: service.reviewCount,
    minPrice: service.minPriceMinor ? Number(service.minPriceMinor) : 0,
    currency: service.packages[0]?.currency ?? "XOF",
    categoryName: service.category.nameFr,
  });

  const jsonLdBreadcrumb = breadcrumbJsonLd([
    { name: "Services", url: `${siteUrl}/services` },
    ...(service.category.parent
      ? [{ name: service.category.parent.nameFr, url: `${siteUrl}/recherche?cat=${service.category.parent.slug}` }]
      : []),
    { name: service.category.nameFr, url: `${siteUrl}/recherche?cat=${service.category.slug}` },
    { name: service.title, url: `${siteUrl}/services/${service.slug}` },
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdService) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <Breadcrumbs
        items={[
          { label: "Services", href: "/services" },
          ...(service.category.parent
            ? [{ label: service.category.parent.nameFr, href: `/recherche?cat=${service.category.parent.slug}` }]
            : []),
          { label: service.category.nameFr, href: `/recherche?cat=${service.category.slug}` },
          { label: service.title },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column — details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Image placeholder */}
          <div className="flex h-56 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 text-5xl text-gray-300 sm:h-72">
            🖼️
          </div>

          {/* Seller info */}
          <div className="flex items-center gap-3">
            <Avatar
              name={seller.displayName}
              src={seller.user.image}
              size="lg"
              verified={seller.verifiedBadge}
            />
            <div>
              <p className="font-semibold text-gray-900">{seller.displayName}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                {reputation.totalReviews > 0 && (
                  <StarRating
                    value={reputation.averageRating}
                    size="sm"
                    showValue
                    count={reputation.totalReviews}
                  />
                )}
                {seller.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {seller.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>

          {service.summary && (
            <div className="prose prose-sm max-w-none text-gray-600">
              <p className="whitespace-pre-line">{service.summary}</p>
            </div>
          )}

          {/* FAQ */}
          {service.faqItems.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Questions fréquentes
              </h2>
              <div className="space-y-2">
                {service.faqItems.map((faq) => (
                  <details
                    key={faq.id}
                    className="rounded-lg border border-gray-200 bg-white"
                  >
                    <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-900">
                      {faq.question}
                    </summary>
                    <p className="px-4 pb-3 text-sm text-gray-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reputation.totalReviews > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Avis ({reputation.totalReviews})
              </h2>
              <Card>
                <ReputationSummary
                  averageRating={reputation.averageRating}
                  totalReviews={reputation.totalReviews}
                  distribution={reputation.distribution}
                />
              </Card>
              <div className="mt-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    rating={review.rating}
                    comment={review.comment}
                    buyerName={review.order.buyer.buyerProfile?.displayName ?? "Acheteur"}
                    buyerImage={review.order.buyer.image}
                    createdAt={review.createdAt.toISOString()}
                    sellerResponse={review.sellerResponse}
                    sellerRespondedAt={review.sellerRespondedAt?.toISOString()}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — packages */}
        <div className="space-y-4">
          {service.packages.map((pkg) => (
            <Card key={pkg.id} className="sticky top-20">
              <Badge variant="primary" className="mb-2">
                {pkg.tier}
              </Badge>
              <h3 className="text-lg font-semibold text-gray-900">{pkg.title}</h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatPrice(pkg.priceMinor)}
              </p>
              {pkg.description && (
                <p className="mt-2 text-sm text-gray-600">{pkg.description}</p>
              )}
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Livraison en {pkg.deliveryDays} jour{pkg.deliveryDays > 1 && "s"}
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-gray-400" />
                  {pkg.revisions} révision{pkg.revisions !== 1 && "s"}
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <form action={createOrderFromPackage}>
                  <input type="hidden" name="packageId" value={pkg.id} />
                  <Button type="submit" className="w-full">
                    Commander — {formatPrice(pkg.priceMinor)}
                  </Button>
                </form>
                <form action={contactSeller}>
                  <input type="hidden" name="sellerUserId" value={seller.userId} />
                  <input type="hidden" name="serviceId" value={service.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full"
                    icon={<MessageCircle className="h-4 w-4" />}
                  >
                    Contacter le vendeur
                  </Button>
                </form>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-xs text-success-700">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Votre argent est protégé jusqu&apos;à la livraison.
              </div>
            </Card>
          ))}

          {/* Extras */}
          {service.extras.length > 0 && (
            <Card>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">
                Options supplémentaires
              </h4>
              {service.extras.map((extra) => (
                <div
                  key={extra.id}
                  className="flex items-center justify-between border-t border-gray-100 py-2 text-sm"
                >
                  <span className="text-gray-700">{extra.title}</span>
                  <span className="font-medium text-gray-900">
                    +{formatPrice(extra.priceMinor)}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
