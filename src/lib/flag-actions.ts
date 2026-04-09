"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { auth } from "./auth";

/**
 * DB-backed feature flags (Phase 7.4).
 * Falls back to env-based flags from Phase 4.61 if DB flag not found.
 */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  try {
    const flag = await prisma.featureFlag.findUnique({ where: { key } });
    if (flag) return flag.enabled;
  } catch {
    /* DB unavailable — fallback to env */
  }

  const envKey = `FEATURE_${key.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
  const v = process.env[envKey]?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export async function toggleFeatureFlag(flagId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return;

  const flag = await prisma.featureFlag.findUnique({ where: { id: flagId } });
  if (!flag) return;

  await prisma.featureFlag.update({
    where: { id: flagId },
    data: { enabled: !flag.enabled },
  });

  revalidatePath("/tableau-de-bord/admin/feature-flags");
}

export async function createFeatureFlag(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return;

  const key = (formData.get("key") as string)?.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  const description = (formData.get("description") as string)?.trim() || null;
  const enabled = formData.get("enabled") === "on";

  if (!key) return;

  await prisma.featureFlag.upsert({
    where: { key },
    create: { key, description, enabled },
    update: { description, enabled },
  });

  revalidatePath("/tableau-de-bord/admin/feature-flags");
}

export async function deleteFeatureFlag(flagId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return;

  await prisma.featureFlag.delete({ where: { id: flagId } }).catch(() => {});
  revalidatePath("/tableau-de-bord/admin/feature-flags");
}
