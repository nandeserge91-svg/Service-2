"use server";

import { prisma } from "./prisma";
import { auth } from "./auth";

interface ExportRow {
  date: string;
  orderId: string;
  buyer: string;
  seller: string;
  service: string;
  status: string;
  currency: string;
  subtotal: string;
  platformFee: string;
  total: string;
  paymentStatus: string;
}

export async function exportTransactionsCSV(
  from?: string,
  to?: string,
): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return null;

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.createdAt = {};
    if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
    if (to) (where.createdAt as Record<string, unknown>).lte = new Date(to);
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10000,
    include: {
      buyer: { select: { email: true } },
      seller: { select: { email: true } },
      service: { select: { title: true } },
      payments: { select: { status: true }, take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  const rows: ExportRow[] = orders.map((o) => ({
    date: o.createdAt.toISOString().slice(0, 10),
    orderId: o.id,
    buyer: o.buyer.email,
    seller: o.seller.email,
    service: o.service.title,
    status: o.status,
    currency: o.currency,
    subtotal: o.subtotalMinor.toString(),
    platformFee: o.platformFeeMinor.toString(),
    total: o.totalMinor.toString(),
    paymentStatus: o.payments[0]?.status ?? "NONE",
  }));

  const headers = [
    "Date", "Commande", "Acheteur", "Vendeur", "Service",
    "Statut", "Devise", "Sous-total (minor)", "Commission (minor)", "Total (minor)", "Paiement",
  ];

  const csv = [
    headers.join(";"),
    ...rows.map((r) =>
      [r.date, r.orderId, r.buyer, r.seller, r.service, r.status, r.currency, r.subtotal, r.platformFee, r.total, r.paymentStatus].join(";"),
    ),
  ].join("\n");

  return csv;
}

export async function exportCommissionsCSV(
  from?: string,
  to?: string,
): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return null;

  const where: Record<string, unknown> = { status: "COMPLETED" };
  if (from || to) {
    where.completedAt = {};
    if (from) (where.completedAt as Record<string, unknown>).gte = new Date(from);
    if (to) (where.completedAt as Record<string, unknown>).lte = new Date(to);
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { completedAt: "desc" },
    take: 10000,
    include: {
      seller: { select: { email: true } },
      service: { select: { title: true, categoryId: true } },
    },
  });

  const headers = [
    "Date completion", "Commande", "Vendeur", "Service", "Categorie",
    "Devise", "Total (minor)", "Commission (minor)", "Taux %",
  ];

  const rows = orders.map((o) => {
    const rate = Number(o.totalMinor) > 0
      ? ((Number(o.platformFeeMinor) / Number(o.totalMinor)) * 100).toFixed(2)
      : "0";
    return [
      o.completedAt?.toISOString().slice(0, 10) ?? "",
      o.id,
      o.seller.email,
      o.service.title,
      o.service.categoryId,
      o.currency,
      o.totalMinor.toString(),
      o.platformFeeMinor.toString(),
      rate,
    ].join(";");
  });

  return [headers.join(";"), ...rows].join("\n");
}
