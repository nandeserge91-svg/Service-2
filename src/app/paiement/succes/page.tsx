"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card padding="lg" className="max-w-md text-center">
        <CheckCircle className="mx-auto mb-3 h-12 w-12 text-success-500" />
        <h1 className="text-xl font-bold text-gray-900">Paiement réussi !</h1>
        <p className="mt-2 text-sm text-gray-500">
          Votre commande est maintenant en cours de traitement. Le vendeur a été
          notifié et va commencer à travailler.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Vos fonds sont en sécurité jusqu&apos;à la livraison.
        </p>
        <div className="mt-6 space-y-2">
          <Link href={`/tableau-de-bord/client/commandes/${orderId}`}>
            <Button className="w-full">Voir ma commande</Button>
          </Link>
          <Link href="/services">
            <Button variant="ghost" className="w-full">
              Continuer à parcourir
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
