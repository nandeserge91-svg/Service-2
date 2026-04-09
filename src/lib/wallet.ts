"use server";

import { auth } from "./auth";
import { prisma } from "./prisma";

interface ActionResult {
  success?: boolean;
  error?: string;
  withdrawalId?: string;
}

export async function requestWithdrawal(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const amountStr = formData.get("amount") as string;
  const amount = parseInt(amountStr, 10);

  if (isNaN(amount) || amount < 1000) {
    return { error: "Le montant minimum de retrait est de 1 000 FCFA." };
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!seller) return { error: "Profil vendeur introuvable." };

  const wallet = await prisma.financialWallet.findUnique({
    where: {
      sellerProfileId_currency: { sellerProfileId: seller.id, currency: "XOF" },
    },
  });

  if (!wallet || wallet.availableMinor < BigInt(amount)) {
    return { error: "Solde insuffisant." };
  }

  const [, withdrawal] = await prisma.$transaction([
    prisma.financialWallet.update({
      where: { id: wallet.id },
      data: { availableMinor: { decrement: BigInt(amount) } },
    }),
    prisma.withdrawalRequest.create({
      data: {
        walletId: wallet.id,
        amountMinor: BigInt(amount),
        currency: "XOF",
        status: "REQUESTED",
      },
    }),
  ]);

  return { success: true, withdrawalId: withdrawal.id };
}
