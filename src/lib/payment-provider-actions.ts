"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { auth } from "./auth";

export async function getPaymentProviders() {
  return prisma.paymentProvider.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function getActiveProviders(countryCode?: string, currency?: string) {
  const providers = await prisma.paymentProvider.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return providers.filter((p) => {
    if (countryCode && p.countries.length > 0 && !p.countries.includes(countryCode)) return false;
    if (currency && p.currencies.length > 0 && !p.currencies.includes(currency)) return false;
    return true;
  });
}

export async function upsertProvider(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return;

  const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  const nameFr = (formData.get("nameFr") as string)?.trim();
  const nameEn = (formData.get("nameEn") as string)?.trim();
  const currencies = (formData.get("currencies") as string)?.trim().toUpperCase().split(",").filter(Boolean) ?? [];
  const countries = (formData.get("countries") as string)?.trim().toUpperCase().split(",").filter(Boolean) ?? [];
  if (!slug || !nameFr || !nameEn) return;

  await prisma.paymentProvider.upsert({
    where: { slug },
    create: { slug, nameFr, nameEn, currencies, countries },
    update: { nameFr, nameEn, currencies, countries },
  });

  revalidatePath("/tableau-de-bord/admin/fournisseurs-paiement");
}

export async function toggleProvider(providerId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return;

  const p = await prisma.paymentProvider.findUnique({ where: { id: providerId } });
  if (!p) return;

  await prisma.paymentProvider.update({
    where: { id: providerId },
    data: { active: !p.active },
  });

  revalidatePath("/tableau-de-bord/admin/fournisseurs-paiement");
}

export async function deleteProvider(providerId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return;

  await prisma.paymentProvider.delete({ where: { id: providerId } }).catch(() => {});
  revalidatePath("/tableau-de-bord/admin/fournisseurs-paiement");
}
