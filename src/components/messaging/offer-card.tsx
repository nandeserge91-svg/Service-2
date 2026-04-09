"use client";

import { useState } from "react";
import { Clock, RefreshCw, CheckCircle, XCircle, AlertTriangle, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { respondToOffer } from "@/lib/offer-actions";

export interface OfferData {
  id: string;
  status: string;
  title: string;
  description: string | null;
  amountMinor: string;
  currency: string;
  deliveryDays: number | null;
  revisions: number | null;
  expiresAt: string | null;
  createdAt: string;
  sellerName: string;
  iAmSeller: boolean;
  iAmBuyer: boolean;
  orderId: string | null;
  orderStatus: string | null;
}

const statusConfig: Record<
  string,
  { label: string; variant: "primary" | "success" | "danger" | "warning" | "default"; icon: React.ElementType }
> = {
  SENT: { label: "En attente", variant: "warning", icon: Clock },
  ACCEPTED: { label: "Acceptée", variant: "success", icon: CheckCircle },
  REJECTED: { label: "Refusée", variant: "danger", icon: XCircle },
  EXPIRED: { label: "Expirée", variant: "default", icon: AlertTriangle },
};

export function OfferCard({
  offer,
  onUpdate,
}: {
  offer: OfferData;
  onUpdate?: () => void;
}) {
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState("");

  const st = statusConfig[offer.status] ?? statusConfig.SENT;
  const isPending = offer.status === "SENT";
  const isExpired =
    isPending && offer.expiresAt && new Date(offer.expiresAt) < new Date();

  async function handleRespond(action: "accept" | "reject") {
    setError("");
    setLoading(action);

    const result = await respondToOffer(offer.id, action);
    setLoading(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    onUpdate?.();
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        isPending && !isExpired
          ? "border-primary-200 bg-primary-50/50"
          : "border-gray-200 bg-gray-50",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-500">
            Offre de {offer.sellerName}
          </span>
        </div>
        <Badge variant={isExpired ? "default" : st.variant}>
          <st.icon className="mr-1 inline h-3 w-3" />
          {isExpired ? "Expirée" : st.label}
        </Badge>
      </div>

      <h4 className="text-sm font-semibold text-gray-900">{offer.title}</h4>

      {offer.description && (
        <p className="mt-1 text-sm text-gray-600">{offer.description}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <span className="font-semibold text-gray-900">
          {formatPrice(BigInt(offer.amountMinor))}
        </span>
        {offer.deliveryDays != null && (
          <span className="flex items-center gap-1 text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            {offer.deliveryDays} jour{offer.deliveryDays > 1 ? "s" : ""}
          </span>
        )}
        {offer.revisions != null && (
          <span className="flex items-center gap-1 text-gray-500">
            <RefreshCw className="h-3.5 w-3.5" />
            {offer.revisions} révision{offer.revisions !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {offer.expiresAt && isPending && !isExpired && (
        <p className="mt-2 text-xs text-gray-400">
          Expire le{" "}
          {new Date(offer.expiresAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
          })}
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-danger-600">{error}</p>
      )}

      {/* Buyer actions */}
      {offer.iAmBuyer && isPending && !isExpired && (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            onClick={() => handleRespond("accept")}
            loading={loading === "accept"}
            disabled={loading !== null}
            icon={<CheckCircle className="h-4 w-4" />}
          >
            Accepter
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRespond("reject")}
            loading={loading === "reject"}
            disabled={loading !== null}
          >
            Refuser
          </Button>
        </div>
      )}

      {/* Link to order if accepted */}
      {offer.orderId && offer.status === "ACCEPTED" && (
        <div className="mt-3">
          <Link
            href={
              offer.iAmSeller
                ? `/tableau-de-bord/vendeur/commandes/${offer.orderId}`
                : `/tableau-de-bord/client/commandes/${offer.orderId}`
            }
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Voir la commande <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Seller waiting notice */}
      {offer.iAmSeller && isPending && !isExpired && (
        <p className="mt-3 text-xs text-gray-400">
          En attente de la réponse du client…
        </p>
      )}
    </div>
  );
}
