import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/reviews?serviceId=xxx — paginated reviews for a service.
 * GET /api/reviews?sellerUserId=xxx — paginated reviews for a seller.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const serviceId = url.searchParams.get("serviceId");
  const sellerUserId = url.searchParams.get("sellerUserId");
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 10), 30);

  if (!serviceId && !sellerUserId) {
    return NextResponse.json({ error: "serviceId ou sellerUserId requis" }, { status: 400 });
  }

  const where = serviceId
    ? { order: { serviceId } }
    : { order: { sellerUserId: sellerUserId! } };

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      order: {
        select: {
          service: { select: { title: true } },
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

  const hasMore = reviews.length > limit;
  const items = hasMore ? reviews.slice(0, limit) : reviews;

  return NextResponse.json({
    items: items.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      sellerResponse: r.sellerResponse,
      sellerRespondedAt: r.sellerRespondedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      buyerName: r.order.buyer.buyerProfile?.displayName ?? "Acheteur",
      buyerImage: r.order.buyer.image,
      serviceTitle: r.order.service.title,
    })),
    nextCursor: hasMore ? items[items.length - 1].id : null,
  });
}
