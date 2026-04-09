"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { takeDisputeUnderReview, resolveDispute } from "@/lib/dispute-actions";

interface Props {
  disputeId: string;
  status: string;
}

export function DisputeAdminActions({ disputeId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [resolveOpen, setResolveOpen] = useState(false);

  async function handleTakeReview() {
    setError("");
    setLoading("review");
    const res = await takeDisputeUnderReview(disputeId);
    setLoading(null);
    if (res.error) setError(res.error);
    else router.refresh();
  }

  async function handleResolve(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading("resolve");
    const fd = new FormData(e.currentTarget);
    fd.set("disputeId", disputeId);
    const res = await resolveDispute(fd);
    setLoading(null);
    if (res.error) {
      setError(res.error);
    } else {
      setResolveOpen(false);
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}

      {status === "OPEN" && (
        <Button
          className="w-full"
          icon={<Eye className="h-4 w-4" />}
          loading={loading === "review"}
          onClick={handleTakeReview}
        >
          Prendre en charge
        </Button>
      )}

      {(status === "OPEN" || status === "UNDER_REVIEW") && (
        <Button
          variant="outline"
          className="w-full"
          icon={<CheckCircle className="h-4 w-4" />}
          onClick={() => setResolveOpen(true)}
        >
          Résoudre le litige
        </Button>
      )}

      <Modal
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        title="Résoudre le litige"
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Décision
            </label>
            <select
              name="resolutionType"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            >
              <option value="">Choisir…</option>
              <option value="REFUND_BUYER">Rembourser le client</option>
              <option value="RELEASE_SELLER">Libérer les fonds au vendeur</option>
              <option value="PARTIAL_REFUND">Remboursement partiel</option>
            </select>
          </div>

          <Textarea
            name="note"
            label="Note de résolution"
            placeholder="Expliquez la décision prise…"
            rows={3}
          />

          <div className="rounded-lg bg-warning-50 px-4 py-3 text-xs text-warning-700">
            Cette action est irréversible et déclenchera le mouvement des fonds en séquestre.
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setResolveOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" loading={loading === "resolve"}>
              Confirmer la résolution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
