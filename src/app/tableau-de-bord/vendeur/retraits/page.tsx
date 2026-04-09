"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, CheckCircle, Clock, XCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requestWithdrawal } from "@/lib/wallet";
import { formatPrice } from "@/lib/utils";

interface WalletData {
  availableMinor: string;
  withdrawals: {
    id: string;
    amountMinor: string;
    status: string;
    createdAt: string;
  }[];
}

const statusMap: Record<string, { label: string; variant: "warning" | "success" | "danger" | "primary" }> = {
  REQUESTED: { label: "En attente", variant: "warning" },
  APPROVED: { label: "Approuvé", variant: "primary" },
  PAID: { label: "Versé", variant: "success" },
  REJECTED: { label: "Refusé", variant: "danger" },
};

export default function RetraitsPage() {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function fetchData() {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((d) => setData(d.data ?? null))
      .catch(() => {});
  }

  useEffect(fetchData, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await requestWithdrawal(form);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      fetchData();
      (e.target as HTMLFormElement).reset();
    }
  }

  const available = BigInt(data?.availableMinor ?? "0");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Retraits</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: form */}
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardTitle className="mb-1">Solde disponible</CardTitle>
            <p className="text-3xl font-bold text-gray-900">
              {formatPrice(available)}
            </p>
          </Card>

          <Card>
            <CardTitle className="mb-4">Demander un retrait</CardTitle>

            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700">
                <CheckCircle className="h-4 w-4" /> Demande envoyée.
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="amount"
                type="number"
                label="Montant (FCFA)"
                placeholder="10000"
                required
                min={1000}
              />
              <p className="text-xs text-gray-400">
                Minimum : 1 000 FCFA. Les retraits sont traités sous 48h ouvrées.
              </p>
              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={available < BigInt(1000)}
                icon={<ArrowDownToLine className="h-4 w-4" />}
              >
                Demander le retrait
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: history */}
        <div className="lg:col-span-2">
          <Card>
            <CardTitle className="mb-3">Historique des retraits</CardTitle>
            {!data?.withdrawals?.length ? (
              <EmptyState
                icon={<Wallet className="h-8 w-8" />}
                title="Aucun retrait"
                description="Vos demandes de retrait apparaîtront ici."
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {data.withdrawals.map((w) => {
                  const st = statusMap[w.status] ?? statusMap.REQUESTED;
                  return (
                    <div
                      key={w.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(BigInt(w.amountMinor))}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(w.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
