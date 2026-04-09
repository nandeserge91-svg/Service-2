"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { auth } from "./auth";

export async function convertAmount(
  amountMinor: bigint,
  fromCurrency: string,
  toCurrency: string,
): Promise<{ amountMinor: bigint; rate: number } | null> {
  if (fromCurrency === toCurrency) return { amountMinor, rate: 1 };

  const now = new Date();
  const exchangeRate = await prisma.exchangeRate.findFirst({
    where: {
      baseCurrency: fromCurrency,
      currency: toCurrency,
      validFrom: { lte: now },
      OR: [{ validTo: null }, { validTo: { gte: now } }],
    },
    orderBy: { validFrom: "desc" },
  });

  if (!exchangeRate) return null;

  const converted = BigInt(Math.round(Number(amountMinor) * exchangeRate.rate));
  return { amountMinor: converted, rate: exchangeRate.rate };
}

export async function getSupportedCurrencies() {
  return prisma.supportedCurrency.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getExchangeRates() {
  return prisma.exchangeRate.findMany({
    where: {
      OR: [{ validTo: null }, { validTo: { gte: new Date() } }],
    },
    orderBy: { validFrom: "desc" },
  });
}

export async function upsertExchangeRate(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return;

  const baseCurrency = (formData.get("baseCurrency") as string)?.trim().toUpperCase();
  const currency = (formData.get("currency") as string)?.trim().toUpperCase();
  const rateStr = (formData.get("rate") as string)?.trim();
  if (!baseCurrency || !currency || !rateStr) return;

  const rate = parseFloat(rateStr);
  if (isNaN(rate) || rate <= 0) return;
  const inverseRate = 1 / rate;

  // Expire old rate
  await prisma.exchangeRate.updateMany({
    where: {
      baseCurrency,
      currency,
      validTo: null,
    },
    data: { validTo: new Date() },
  });

  await prisma.exchangeRate.create({
    data: { baseCurrency, currency, rate, inverseRate, source: "MANUAL" },
  });

  // Also create/update the inverse
  await prisma.exchangeRate.updateMany({
    where: {
      baseCurrency: currency,
      currency: baseCurrency,
      validTo: null,
    },
    data: { validTo: new Date() },
  });

  await prisma.exchangeRate.create({
    data: {
      baseCurrency: currency,
      currency: baseCurrency,
      rate: inverseRate,
      inverseRate: rate,
      source: "MANUAL",
    },
  });

  revalidatePath("/tableau-de-bord/admin/devises");
}

export async function upsertCurrency(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return;

  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const symbol = (formData.get("symbol") as string)?.trim();
  const nameFr = (formData.get("nameFr") as string)?.trim();
  const nameEn = (formData.get("nameEn") as string)?.trim();
  const decimals = parseInt(formData.get("decimals") as string) || 0;
  if (!code || !symbol || !nameFr || !nameEn) return;

  await prisma.supportedCurrency.upsert({
    where: { code },
    create: { code, symbol, nameFr, nameEn, decimals },
    update: { symbol, nameFr, nameEn, decimals },
  });

  revalidatePath("/tableau-de-bord/admin/devises");
}

export async function toggleCurrency(currencyId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return;

  const cur = await prisma.supportedCurrency.findUnique({ where: { id: currencyId } });
  if (!cur) return;

  await prisma.supportedCurrency.update({
    where: { id: currencyId },
    data: { active: !cur.active },
  });

  revalidatePath("/tableau-de-bord/admin/devises");
}
