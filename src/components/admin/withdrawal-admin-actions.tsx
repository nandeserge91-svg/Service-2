"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalPaid,
} from "@/lib/admin-actions";

interface Props {
  withdrawalId: string;
  status: string;
  payoutRef?: string | null;
}

export function WithdrawalAdminActions({ withdrawalId, status, payoutRef }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);

  async function exec(action: () => Promise<{ success?: boolean }>, key: string) {
    setLoading(key);
    await action();
    setLoading(null);
    router.refresh();
  }

  if (status === "PAID") {
    return (
      <span className="text-xs text-gray-400" title={payoutRef ?? undefined}>
        Ref: {payoutRef?.slice(0, 12) ?? "—"}
      </span>
    );
  }

  if (status === "REJECTED") return null;

  return (
    <div className="flex gap-1">
      {status === "REQUESTED" && (
        <>
          <Button
            size="sm"
            variant="ghost"
            loading={loading === "approve"}
            onClick={() => exec(() => approveWithdrawal(withdrawalId), "approve")}
          >
            <CheckCircle className="mr-1 h-3.5 w-3.5 text-success-500" /> Approuver
          </Button>
          <Button
            size="sm"
            variant="ghost"
            loading={loading === "reject"}
            onClick={() => exec(() => rejectWithdrawal(withdrawalId), "reject")}
          >
            <XCircle className="mr-1 h-3.5 w-3.5 text-danger-500" /> Refuser
          </Button>
        </>
      )}
      {status === "APPROVED" && (
        <>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPayOpen(true)}
          >
            <Banknote className="mr-1 h-3.5 w-3.5 text-success-500" /> Marquer versé
          </Button>
          <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Confirmer le versement">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const ref = new FormData(e.currentTarget).get("payoutRef") as string;
                if (!ref?.trim()) return;
                setPayOpen(false);
                await exec(() => markWithdrawalPaid(withdrawalId, ref.trim()), "pay");
              }}
              className="space-y-4"
            >
              <Input
                name="payoutRef"
                label="Référence de paiement"
                placeholder="Ex: MOMO-2026-04-08-1234"
                required
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setPayOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" loading={loading === "pay"}>
                  Confirmer
                </Button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
}
