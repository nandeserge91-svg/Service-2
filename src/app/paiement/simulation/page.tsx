"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { CreditCard, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function SimulationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("paymentId") ?? "";
  const orderId = searchParams.get("orderId") ?? "";
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handlePay() {
    setLoading(true);

    const res = await fetch("/api/webhooks/chariow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "successful.sale",
        data: {
          id: `sim_${Date.now()}`,
          status: "completed",
          custom_metadata: {
            internal_payment_id: paymentId,
            internal_order_id: orderId,
          },
        },
      }),
    });

    setLoading(false);

    if (res.ok) {
      setDone(true);
      setTimeout(() => {
        router.push(`/paiement/succes?orderId=${orderId}`);
      }, 1000);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card padding="lg" className="max-w-md text-center">
          <CheckCircle className="mx-auto mb-3 h-12 w-12 text-success-500" />
          <h1 className="text-xl font-bold text-gray-900">Paiement confirmé</h1>
          <p className="mt-2 text-sm text-gray-500">Redirection en cours…</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card padding="lg" className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-50">
          <CreditCard className="h-8 w-8 text-warning-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Simulation de paiement</h1>
        <p className="mt-2 text-sm text-gray-500">
          Mode développement — en production, vous seriez redirigé vers Chariow
          pour payer via mobile money ou carte bancaire.
        </p>
        <div className="mt-6">
          <Button
            onClick={handlePay}
            loading={loading}
            className="w-full"
            icon={<CreditCard className="h-4 w-4" />}
          >
            Simuler le paiement réussi
          </Button>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Commande #{orderId.slice(-8).toUpperCase()}
        </p>
      </Card>
    </div>
  );
}

export default function SimulationPage() {
  return (
    <Suspense>
      <SimulationForm />
    </Suspense>
  );
}
