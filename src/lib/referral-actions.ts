"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { auth } from "./auth";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const REFERRAL_CREDIT_MINOR = BigInt(100000); // 1 000 XOF

export async function ensureReferralCode(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referralCode: true },
  });
  if (!user) return null;
  if (user.referralCode) return user.referralCode;

  let code = generateReferralCode();
  let attempts = 0;
  while (attempts < 5) {
    const exists = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!exists) break;
    code = generateReferralCode();
    attempts++;
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { referralCode: code },
    select: { referralCode: true },
  });

  return updated.referralCode;
}

export async function applyReferralAtRegistration(
  newUserId: string,
  referralCode: string,
): Promise<boolean> {
  if (!referralCode.trim()) return false;

  const referrer = await prisma.user.findUnique({
    where: { referralCode: referralCode.trim().toUpperCase() },
    select: { id: true },
  });
  if (!referrer || referrer.id === newUserId) return false;

  const existing = await prisma.referral.findUnique({
    where: { referredUserId: newUserId },
  });
  if (existing) return false;

  await prisma.referral.create({
    data: {
      referrerUserId: referrer.id,
      referredUserId: newUserId,
      code: referralCode.trim().toUpperCase(),
      creditMinor: REFERRAL_CREDIT_MINOR,
      currency: "XOF",
    },
  });

  return true;
}

export async function creditReferralBonus(referredUserId: string): Promise<void> {
  const referral = await prisma.referral.findUnique({
    where: { referredUserId },
  });
  if (!referral || referral.credited) return;

  await prisma.referral.update({
    where: { id: referral.id },
    data: { credited: true },
  });

  await prisma.notification.create({
    data: {
      userId: referral.referrerUserId,
      channel: "in_app",
      title: "Bonus de parrainage",
      body: `Un de vos filleuls a effectué sa première commande. Votre bonus de parrainage a été crédité.`,
      dataJson: { type: "referral", referralId: referral.id },
    },
  });
}

export async function getReferralStats(userId: string) {
  const [user, referrals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    }),
    prisma.referral.findMany({
      where: { referrerUserId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        referred: {
          select: {
            buyerProfile: { select: { displayName: true } },
            sellerProfile: { select: { displayName: true } },
            createdAt: true,
          },
        },
      },
    }),
  ]);

  const totalReferred = referrals.length;
  const totalCredited = referrals.filter((r) => r.credited).length;
  const totalCreditMinor = referrals
    .filter((r) => r.credited)
    .reduce((sum, r) => sum + r.creditMinor, BigInt(0));

  return {
    code: user?.referralCode,
    totalReferred,
    totalCredited,
    totalCreditMinor,
    referrals,
  };
}
