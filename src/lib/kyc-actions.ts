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

export async function submitKyc(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return;
  if (profile.kycStatus === "VERIFIED" || profile.kycStatus === "PENDING") return;

  const documentUrl = (formData.get("documentUrl") as string)?.trim();
  if (!documentUrl) return;

  const note = (formData.get("note") as string)?.trim() || null;

  await prisma.sellerProfile.update({
    where: { id: profile.id },
    data: {
      kycStatus: "PENDING",
      kycSubmittedAt: new Date(),
      kycDocumentUrl: documentUrl,
      kycNote: note,
    },
  });

  revalidatePath("/tableau-de-bord/vendeur/kyc");
}

export async function reviewKyc(
  profileId: string,
  decision: "VERIFIED" | "REJECTED",
  adminNote?: string,
): Promise<void> {
  const actorId = await requireAdmin();
  if (typeof actorId !== "string") return;

  const profile = await prisma.sellerProfile.findUnique({
    where: { id: profileId },
    select: { id: true, userId: true, kycStatus: true, displayName: true },
  });
  if (!profile || profile.kycStatus !== "PENDING") return;

  await prisma.sellerProfile.update({
    where: { id: profileId },
    data: {
      kycStatus: decision,
      verifiedBadge: decision === "VERIFIED",
      kycNote: adminNote || null,
    },
  });

  const title = decision === "VERIFIED" ? "KYC validé" : "KYC refusé";
  const body =
    decision === "VERIFIED"
      ? "Votre identité a été vérifiée. Vous avez obtenu le badge vérifié."
      : `Votre demande de vérification a été refusée.${adminNote ? ` Motif : ${adminNote}` : ""}`;

  prisma.notification
    .create({
      data: {
        userId: profile.userId,
        channel: "in_app",
        title,
        body,
        dataJson: { type: "kyc", decision },
      },
    })
    .catch(() => {});

  revalidatePath("/tableau-de-bord/admin/kyc");
}
