"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { auth } from "./auth";
import { SUBSCRIPTION_PLANS, type PlanKey } from "./subscription-plans";

export async function subscribeToPlan(plan: PlanKey): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return;

  const existing = await prisma.sellerSubscription.findFirst({
    where: { sellerProfileId: profile.id, status: "ACTIVE" },
  });

  if (existing) {
    await prisma.sellerSubscription.update({
      where: { id: existing.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
  }

  const planConfig = SUBSCRIPTION_PLANS[plan];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  await prisma.sellerSubscription.create({
    data: {
      sellerProfileId: profile.id,
      plan,
      status: "ACTIVE",
      priceMinor: planConfig.priceMinor,
      currency: "XOF",
      endDate: plan === "FREE" ? null : endDate,
    },
  });

  revalidatePath("/tableau-de-bord/vendeur/abonnement");
}

export async function cancelSubscription(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return;

  const active = await prisma.sellerSubscription.findFirst({
    where: { sellerProfileId: profile.id, status: "ACTIVE", plan: { not: "FREE" } },
  });
  if (!active) return;

  await prisma.sellerSubscription.update({
    where: { id: active.id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  revalidatePath("/tableau-de-bord/vendeur/abonnement");
}

export async function getActiveSubscription(sellerProfileId: string) {
  return prisma.sellerSubscription.findFirst({
    where: { sellerProfileId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
}
