import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!seller) {
    return NextResponse.json({ data: null });
  }

  const wallet = await prisma.financialWallet.findUnique({
    where: {
      sellerProfileId_currency: { sellerProfileId: seller.id, currency: "XOF" },
    },
    include: {
      withdrawals: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });

  return NextResponse.json({
    data: wallet
      ? {
          availableMinor: wallet.availableMinor.toString(),
          pendingMinor: wallet.pendingMinor.toString(),
          withdrawals: wallet.withdrawals.map((w) => ({
            id: w.id,
            amountMinor: w.amountMinor.toString(),
            status: w.status,
            createdAt: w.createdAt.toISOString(),
          })),
        }
      : null,
  });
}
