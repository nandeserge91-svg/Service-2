"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, CheckCircle, RefreshCw, XCircle, CreditCard, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import {
  deliverOrder,
  acceptDelivery,
  requestRevision,
  cancelOrder,
} from "@/lib/order-actions";
import { initiatePayment } from "@/lib/payment-actions";
import { openDispute } from "@/lib/dispute-actions";

interface Props {
  orderId: string;
  status: string;
  role: "buyer" | "seller";
}

export function OrderActions({ orderId, status, role }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);

  async function exec(
    action: () => Promise<{ success?: boolean; error?: string }>,
    key: string,
  ) {
    setError("");
    setLoading(key);
    const res = await action();
    setLoading(null);
    if (res.error) {
      setError(res.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      {/* Buyer: pay via Chariow (or simulation in dev) */}
      {role === "buyer" && status === "PENDING_PAYMENT" && (
        <div className="space-y-2">
          <form action={initiatePayment.bind(null, orderId)}>
            <Button
              type="submit"
              className="w-full"
              icon={<CreditCard className="h-4 w-4" />}
              loading={loading === "pay"}
              onClick={() => setLoading("pay")}
            >
              Payer la commande
            </Button>
          </form>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => exec(() => cancelOrder(orderId), "cancel")}
            loading={loading === "cancel"}
          >
            <XCircle className="mr-1 h-4 w-4" /> Annuler
          </Button>
        </div>
      )}

      {/* Seller: deliver */}
      {role === "seller" && (status === "IN_PROGRESS" || status === "REVISION_REQUESTED") && (
        <Button
          className="w-full"
          icon={<Package className="h-4 w-4" />}
          onClick={() => setDeliveryOpen(true)}
        >
          Marquer comme livré
        </Button>
      )}

      {/* Buyer: accept or revise */}
      {role === "buyer" && status === "DELIVERED" && (
        <div className="space-y-2">
          <Button
            className="w-full"
            icon={<CheckCircle className="h-4 w-4" />}
            loading={loading === "accept"}
            onClick={() => exec(() => acceptDelivery(orderId), "accept")}
          >
            Accepter la livraison
          </Button>
          <Button
            variant="outline"
            className="w-full"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => setRevisionOpen(true)}
          >
            Demander une révision
          </Button>
        </div>
      )}

      {/* Buyer: cancel while PAID (grace period) */}
      {role === "buyer" && status === "PAID" && (
        <Button
          variant="ghost"
          className="w-full"
          loading={loading === "cancel"}
          onClick={() => exec(() => cancelOrder(orderId), "cancel")}
        >
          <XCircle className="mr-1 h-4 w-4" /> Annuler la commande
        </Button>
      )}

      {/* Buyer: open dispute on active orders */}
      {role === "buyer" &&
        ["IN_PROGRESS", "DELIVERED", "REVISION_REQUESTED"].includes(status) && (
          <Button
            variant="ghost"
            className="w-full text-danger-600 hover:bg-danger-50"
            onClick={() => setDisputeOpen(true)}
          >
            <AlertTriangle className="mr-1 h-4 w-4" /> Ouvrir un litige
          </Button>
        )}

      {/* Delivery modal */}
      <Modal
        open={deliveryOpen}
        onClose={() => setDeliveryOpen(false)}
        title="Livrer la commande"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const msg = (fd.get("message") as string) || undefined;
            setDeliveryOpen(false);
            await exec(() => deliverOrder(orderId, msg), "deliver");
          }}
          className="space-y-4"
        >
          <Textarea
            name="message"
            label="Message de livraison (optionnel)"
            placeholder="Décrivez ce qui a été livré, ajoutez des instructions…"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setDeliveryOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" icon={<Package className="h-4 w-4" />}>
              Confirmer la livraison
            </Button>
          </div>
        </form>
      </Modal>

      {/* Revision modal */}
      <Modal
        open={revisionOpen}
        onClose={() => setRevisionOpen(false)}
        title="Demander une révision"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const reason = fd.get("reason") as string;
            if (!reason?.trim()) return;
            setRevisionOpen(false);
            await exec(() => requestRevision(orderId, reason), "revision");
          }}
          className="space-y-4"
        >
          <Textarea
            name="reason"
            label="Que souhaitez-vous modifier ?"
            placeholder="Soyez précis pour que le vendeur comprenne vos attentes…"
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setRevisionOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" icon={<RefreshCw className="h-4 w-4" />}>
              Envoyer la demande
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dispute modal */}
      <Modal
        open={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        title="Ouvrir un litige"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            fd.set("orderId", orderId);
            setDisputeOpen(false);
            await exec(() => openDispute(fd), "dispute");
          }}
          className="space-y-4"
        >
          <div className="rounded-lg bg-warning-50 px-4 py-3 text-sm text-warning-700">
            <p className="font-medium">Attention</p>
            <p className="mt-1">
              L&apos;ouverture d&apos;un litige gèlera les fonds en séquestre.
              Essayez d&apos;abord de résoudre le problème avec le vendeur via la messagerie.
            </p>
          </div>
          <Textarea
            name="reason"
            label="Décrivez le problème rencontré"
            placeholder="Soyez aussi précis que possible : qu'avez-vous commandé, qu'avez-vous reçu, quel est le problème…"
            required
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setDisputeOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" icon={<AlertTriangle className="h-4 w-4" />}>
              Confirmer le litige
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
