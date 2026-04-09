"use server";

import { auth } from "./auth";
import { prisma } from "./prisma";

interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function updateClientProfile(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const displayName = (formData.get("displayName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!displayName) return { error: "Le nom est obligatoire." };

  await prisma.buyerProfile.upsert({
    where: { userId: session.user.id },
    update: { displayName, phone },
    create: { userId: session.user.id, displayName, phone },
  });

  return { success: true };
}

export async function updateSellerProfile(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const displayName = (formData.get("displayName") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const languages = (formData.get("languages") as string)
    ?.split(",")
    .map((l) => l.trim())
    .filter(Boolean) ?? [];

  if (!displayName) return { error: "Le nom est obligatoire." };

  await prisma.sellerProfile.update({
    where: { userId: session.user.id },
    data: { displayName, bio, city, phone, languages },
  });

  return { success: true };
}
