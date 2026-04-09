"use server";

import { prisma } from "./prisma";

export async function getSimilarServices(
  serviceId: string,
  categoryId: string,
  limit = 4,
) {
  return prisma.service.findMany({
    where: {
      id: { not: serviceId },
      categoryId,
      status: "PUBLISHED",
    },
    orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      avgRating: true,
      reviewCount: true,
      minPriceMinor: true,
      minDeliveryDays: true,
      sellerProfile: {
        select: {
          displayName: true,
          verifiedBadge: true,
          user: { select: { image: true } },
        },
      },
      packages: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { priceMinor: true, currency: true },
      },
    },
  });
}

export async function getServicesForComparison(ids: string[]) {
  if (ids.length === 0 || ids.length > 4) return [];

  return prisma.service.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
    include: {
      sellerProfile: {
        select: {
          displayName: true,
          verifiedBadge: true,
          city: true,
          user: { select: { image: true } },
        },
      },
      category: { select: { nameFr: true } },
      packages: { orderBy: { sortOrder: "asc" } },
      _count: { select: { orders: true, favorites: true } },
    },
  });
}

export async function getPopularServices(limit = 6) {
  return prisma.service.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ reviewCount: "desc" }, { avgRating: "desc" }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      avgRating: true,
      reviewCount: true,
      minPriceMinor: true,
      sellerProfile: {
        select: {
          displayName: true,
          verifiedBadge: true,
          user: { select: { image: true } },
        },
      },
      packages: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { priceMinor: true, currency: true },
      },
    },
  });
}

export async function getRecentServices(limit = 6) {
  return prisma.service.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      avgRating: true,
      reviewCount: true,
      minPriceMinor: true,
      createdAt: true,
      sellerProfile: {
        select: {
          displayName: true,
          verifiedBadge: true,
          user: { select: { image: true } },
        },
      },
      packages: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { priceMinor: true, currency: true },
      },
    },
  });
}
