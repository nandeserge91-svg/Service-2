import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { WithdrawalAdminActions } from "@/components/admin/withdrawal-admin-actions";
import { ArrowDownToLine } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, { label: string; variant: "warning" | "success" | "primary" | "default" }> = {
  REQUESTED: { label: "En attente", variant: "warning" },
  APPROVED: { label: "Approuvé", variant: "primary" },
  REJECTED: { label: "Refusé", variant: "default" },
  PAID: { label: "Versé", variant: "success" },
};

export default async function AdminWithdrawalsPage() {
  const withdrawals = await prisma.withdrawalRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      wallet: {
        include: {
          sellerProfile: {
            select: { displayName: true, user: { select: { id: true, image: true, email: true } } },
          },
        },
      },
    },
  });

  const pendingCount = withdrawals.filter((w) => w.status === "REQUESTED").length;
  const approvedCount = withdrawals.filter((w) => w.status === "APPROVED").length;
  const pendingTotal = withdrawals
    .filter((w) => w.status === "REQUESTED")
    .reduce((sum, w) => sum + Number(w.amountMinor), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Demandes de retrait</h1>
        <p className="mt-1 text-sm text-gray-500">
          {pendingCount} en attente ({formatPrice(BigInt(pendingTotal))}) · {approvedCount} approuvés à verser
        </p>
      </div>

      <Card padding="none">
        {withdrawals.length === 0 && (
          <div className="px-6 py-12 text-center">
            <ArrowDownToLine className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">Aucune demande de retrait</p>
          </div>
        )}

        {withdrawals.map((w) => {
          const seller = w.wallet.sellerProfile;
          const cfg = STATUS_MAP[w.status] ?? STATUS_MAP.REQUESTED;
          return (
            <div
              key={w.id}
              className="flex items-center gap-4 border-b border-gray-50 px-5 py-4 last:border-b-0"
            >
              <Avatar name={seller.displayName} src={seller.user.image} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{seller.displayName}</p>
                <p className="text-xs text-gray-400">
                  {seller.user.email} ·{" "}
                  {new Date(w.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {formatPrice(w.amountMinor, w.currency)}
              </p>
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
              <WithdrawalAdminActions
                withdrawalId={w.id}
                status={w.status}
                payoutRef={w.payoutRef}
              />
            </div>
          );
        })}
      </Card>
    </div>
  );
}
