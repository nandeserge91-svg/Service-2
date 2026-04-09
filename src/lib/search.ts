"use server";

import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export interface SearchParams {
  q?: string;
  cat?: string;
  subcat?: string;
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  maxDelivery?: number;
  sort?: string;
  page?: number;
}

export interface SearchResult {
  services: ServiceHit[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categories: CategoryFacet[];
  priceRange: { min: number; max: number };
}

export interface ServiceHit {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  avgRating: number;
  reviewCount: number;
  minPriceMinor: bigint | null;
  minDeliveryDays: number | null;
  currency: string;
  categoryName: string;
  categorySlug: string;
  sellerName: string;
  sellerImage: string | null;
  sellerVerified: boolean;
  orderCount: number;
}

export interface CategoryFacet {
  slug: string;
  nameFr: string;
  count: number;
}

const PAGE_SIZE = 24;

export async function searchServices(params: SearchParams): Promise<SearchResult> {
  const page = Math.max(1, params.page ?? 1);

  const where: Prisma.ServiceWhereInput = { status: "PUBLISHED" };

  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
      { tags: { some: { tag: { labelFr: { contains: q, mode: "insensitive" } } } } },
    ];
  }

  if (params.cat) {
    where.category = {
      OR: [{ slug: params.cat }, { parent: { slug: params.cat } }],
    };
  }
  if (params.subcat) {
    where.category = { slug: params.subcat };
  }

  if (params.priceMin != null || params.priceMax != null) {
    where.minPriceMinor = {};
    if (params.priceMin != null) where.minPriceMinor.gte = BigInt(params.priceMin);
    if (params.priceMax != null) where.minPriceMinor.lte = BigInt(params.priceMax);
  }

  if (params.minRating != null && params.minRating > 0) {
    where.avgRating = { gte: params.minRating };
  }

  if (params.maxDelivery != null && params.maxDelivery > 0) {
    where.minDeliveryDays = { lte: params.maxDelivery };
  }

  const orderBy = buildOrderBy(params.sort);

  const [total, services, categoryFacets, priceAgg] = await Promise.all([
    prisma.service.count({ where }),
    prisma.service.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        avgRating: true,
        reviewCount: true,
        minPriceMinor: true,
        minDeliveryDays: true,
        category: { select: { nameFr: true, slug: true } },
        sellerProfile: {
          select: { displayName: true, verifiedBadge: true, user: { select: { image: true } } },
        },
        packages: {
          orderBy: { priceMinor: "asc" },
          take: 1,
          select: { currency: true },
        },
        _count: { select: { orders: true } },
      },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.$queryRaw<CategoryFacet[]>`
      SELECT c.slug, c."nameFr", COUNT(s.id)::int AS count
      FROM "Category" c
      JOIN "Service" s ON s."categoryId" = c.id
      WHERE s.status = 'PUBLISHED'
      GROUP BY c.id
      ORDER BY count DESC
    `,
    prisma.service.aggregate({
      where: { status: "PUBLISHED", minPriceMinor: { not: null } },
      _min: { minPriceMinor: true },
      _max: { minPriceMinor: true },
    }),
  ]);

  const hits: ServiceHit[] = services.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    avgRating: s.avgRating,
    reviewCount: s.reviewCount,
    minPriceMinor: s.minPriceMinor,
    minDeliveryDays: s.minDeliveryDays,
    currency: s.packages[0]?.currency ?? "XOF",
    categoryName: s.category.nameFr,
    categorySlug: s.category.slug,
    sellerName: s.sellerProfile.displayName,
    sellerImage: s.sellerProfile.user.image,
    sellerVerified: s.sellerProfile.verifiedBadge,
    orderCount: s._count.orders,
  }));

  return {
    services: hits,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    categories: categoryFacets,
    priceRange: {
      min: Number(priceAgg._min.minPriceMinor ?? 0),
      max: Number(priceAgg._max.minPriceMinor ?? 100_000_00),
    },
  };
}

function buildOrderBy(sort?: string): Prisma.ServiceOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ minPriceMinor: { sort: "asc", nulls: "last" } }];
    case "price_desc":
      return [{ minPriceMinor: { sort: "desc", nulls: "last" } }];
    case "rating":
      return [{ avgRating: "desc" }, { reviewCount: "desc" }];
    case "popular":
      return [{ orders: { _count: "desc" } }];
    case "newest":
      return [{ createdAt: "desc" }];
    default:
      return [{ featured: "desc" }, { avgRating: "desc" }, { createdAt: "desc" }];
  }
}

/** Recalculate denormalized search fields for a service. */
export async function syncServiceSearchFields(serviceId: string) {
  const [pkgAgg, reviewAgg] = await Promise.all([
    prisma.servicePackage.aggregate({
      where: { serviceId },
      _min: { priceMinor: true, deliveryDays: true },
    }),
    prisma.review.aggregate({
      where: { order: { serviceId } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      minPriceMinor: pkgAgg._min.priceMinor,
      minDeliveryDays: pkgAgg._min.deliveryDays,
      avgRating: Math.round((reviewAgg._avg.rating ?? 0) * 10) / 10,
      reviewCount: reviewAgg._count.rating,
    },
  });
}
