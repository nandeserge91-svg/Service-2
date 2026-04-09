"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { auth } from "./auth";

async function requireAdmin(): Promise<string | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return { error: "Accès refusé." };
  return session.user.id;
}

export async function validateCoupon(
  code: string,
  subtotalMinor: bigint,
  currency: string,
): Promise<{ valid: boolean; discountMinor: bigint; couponId: string | null; error?: string }> {
  const invalid = { valid: false, discountMinor: BigInt(0), couponId: null };

  if (!code.trim()) return invalid;

  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.active) return { ...invalid, error: "Code invalide ou expiré." };

  const now = new Date();
  if (coupon.validFrom > now) return { ...invalid, error: "Ce coupon n'est pas encore actif." };
  if (coupon.validTo && coupon.validTo < now) return { ...invalid, error: "Ce coupon a expiré." };
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
    return { ...invalid, error: "Ce coupon a atteint sa limite d'utilisation." };
  if (subtotalMinor < coupon.minOrderMinor)
    return { ...invalid, error: `Montant minimum requis non atteint.` };
  if (coupon.currency && coupon.currency !== currency)
    return { ...invalid, error: "Ce coupon n'est pas valide pour cette devise." };

  let discount = BigInt(0);
  if (coupon.discountBps > 0) {
    discount = (subtotalMinor * BigInt(coupon.discountBps)) / BigInt(10000);
  }
  if (coupon.discountFixed > 0) {
    discount = discount + coupon.discountFixed;
  }
  if (discount > subtotalMinor) discount = subtotalMinor;

  return { valid: true, discountMinor: discount, couponId: coupon.id };
}

export async function incrementCouponUsage(couponId: string): Promise<void> {
  await prisma.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });
}

// ——— Admin CRUD ———

export async function createCoupon(formData: FormData): Promise<void> {
  const actorId = await requireAdmin();
  if (typeof actorId !== "string") return;

  const code = (formData.get("code") as string)?.trim().toUpperCase();
  if (!code) return;

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) return;

  const discountBps = parseInt(formData.get("discountBps") as string) || 0;
  const discountFixed = BigInt(formData.get("discountFixed") as string || "0");
  const currency = (formData.get("currency") as string)?.trim() || null;
  const minOrderMinor = BigInt(formData.get("minOrderMinor") as string || "0");
  const maxUses = parseInt(formData.get("maxUses") as string) || null;
  const validTo = (formData.get("validTo") as string)
    ? new Date(formData.get("validTo") as string)
    : null;
  const description = (formData.get("description") as string)?.trim() || null;

  await prisma.coupon.create({
    data: { code, description, discountBps, discountFixed, currency, minOrderMinor, maxUses, validTo },
  });

  revalidatePath("/tableau-de-bord/admin/coupons");
}

export async function toggleCoupon(couponId: string, active: boolean): Promise<void> {
  const actorId = await requireAdmin();
  if (typeof actorId !== "string") return;

  await prisma.coupon.update({ where: { id: couponId }, data: { active } });
  revalidatePath("/tableau-de-bord/admin/coupons");
}

export async function deleteCoupon(couponId: string): Promise<void> {
  const actorId = await requireAdmin();
  if (typeof actorId !== "string") return;

  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
    include: { _count: { select: { orders: true } } },
  });
  if (!coupon || coupon._count.orders > 0) return;

  await prisma.coupon.delete({ where: { id: couponId } });
  revalidatePath("/tableau-de-bord/admin/coupons");
}
