"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { auth } from "./auth";

export async function getCountryConfigs() {
  return prisma.countryConfig.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function getActiveCountries() {
  return prisma.countryConfig.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCountryByCode(code: string) {
  return prisma.countryConfig.findUnique({ where: { countryCode: code } });
}

export async function upsertCountry(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return;

  const countryCode = (formData.get("countryCode") as string)?.trim().toUpperCase();
  const nameFr = (formData.get("nameFr") as string)?.trim();
  const nameEn = (formData.get("nameEn") as string)?.trim();
  const defaultCurrency = (formData.get("defaultCurrency") as string)?.trim().toUpperCase();
  const currencies = (formData.get("currencies") as string)?.trim().toUpperCase().split(",").filter(Boolean) ?? [];
  const providers = (formData.get("providers") as string)?.trim().toLowerCase().split(",").filter(Boolean) ?? [];
  const timezone = (formData.get("timezone") as string)?.trim() || "Africa/Abidjan";
  const taxLabel = (formData.get("taxLabel") as string)?.trim() || null;
  const taxBps = parseInt(formData.get("taxBps") as string) || 0;

  if (!countryCode || !nameFr || !nameEn || !defaultCurrency) return;

  await prisma.countryConfig.upsert({
    where: { countryCode },
    create: {
      countryCode, nameFr, nameEn, defaultCurrency,
      currencies, providers, timezone, taxLabel, taxBps,
    },
    update: {
      nameFr, nameEn, defaultCurrency,
      currencies, providers, timezone, taxLabel, taxBps,
    },
  });

  revalidatePath("/tableau-de-bord/admin/pays");
}

export async function toggleCountry(countryId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return;

  const c = await prisma.countryConfig.findUnique({ where: { id: countryId } });
  if (!c) return;

  await prisma.countryConfig.update({
    where: { id: countryId },
    data: { active: !c.active },
  });

  revalidatePath("/tableau-de-bord/admin/pays");
}

export async function deleteCountry(countryId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return;

  await prisma.countryConfig.delete({ where: { id: countryId } }).catch(() => {});
  revalidatePath("/tableau-de-bord/admin/pays");
}
