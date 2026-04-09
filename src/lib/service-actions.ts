"use server";

import { auth } from "./auth";
import { prisma } from "./prisma";
import { slugify } from "./utils";
import { syncServiceSearchFields } from "./search";

interface ActionResult {
  success?: boolean;
  error?: string;
  serviceId?: string;
}

export async function createService(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!seller) return { error: "Profil vendeur introuvable." };

  const title = (formData.get("title") as string)?.trim();
  const categoryId = formData.get("categoryId") as string;
  const summary = (formData.get("summary") as string)?.trim();
  const status = formData.get("publish") === "true" ? "PUBLISHED" : "DRAFT";

  const pkgTitle = (formData.get("pkgTitle") as string)?.trim();
  const pkgPrice = parseInt(formData.get("pkgPrice") as string, 10);
  const pkgDays = parseInt(formData.get("pkgDays") as string, 10);
  const pkgRevisions = parseInt(formData.get("pkgRevisions") as string, 10) || 0;
  const pkgDescription = (formData.get("pkgDescription") as string)?.trim();

  if (!title || !categoryId || !pkgTitle || isNaN(pkgPrice) || isNaN(pkgDays)) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }

  if (pkgPrice < 500) {
    return { error: "Le prix minimum est de 500 FCFA." };
  }

  let slug = slugify(title);
  const existingSlug = await prisma.service.findFirst({
    where: { sellerProfileId: seller.id, slug },
  });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const service = await prisma.service.create({
    data: {
      sellerProfileId: seller.id,
      categoryId,
      slug,
      title,
      summary: summary || null,
      status: status as "DRAFT" | "PUBLISHED",
      packages: {
        create: {
          tier: "BASIC",
          title: pkgTitle,
          description: pkgDescription || null,
          priceMinor: BigInt(pkgPrice),
          currency: "XOF",
          deliveryDays: pkgDays,
          revisions: pkgRevisions,
          sortOrder: 0,
        },
      },
    },
  });

  syncServiceSearchFields(service.id).catch(() => {});

  return { success: true, serviceId: service.id };
}
