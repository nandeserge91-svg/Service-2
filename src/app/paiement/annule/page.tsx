"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card padding="lg" className="max-w-md text-center">
        <XCircle className="mx-auto mb-3 h-12 w-12 text-gray-400" />
        <h1 className="text-xl font-bold text-gray-900">Paiement annulé</h1>
        <p className="mt-2 text-sm text-gray-500">
          Le paiement n&apos;a pas abouti. Votre commande est toujours en attente —
          vous pouvez réessayer à tout moment.
        </p>
        <div className="mt-6 space-y-2">
          {orderId && (
            <Link href={`/tableau-de-bord/client/commandes/${orderId}`}>
              <Button className="w-full">Retourner à la commande</Button>
            </Link>
          )}
          <Link href="/tableau-de-bord/client/commandes">
            <Button variant="ghost" className="w-full">
              Mes commandes
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense>
      <CancelContent />
    </Suspense>
  );
}
