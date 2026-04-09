"use client";

import { useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { createOffer } from "@/lib/offer-actions";

interface Props {
  conversationId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function OfferForm({ conversationId, open, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await createOffer(conversationId, form);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onCreated();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Créer une offre personnalisée">
      {error && (
        <div className="mb-4 rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="title"
          label="Titre de l'offre"
          placeholder="Ex : Logo premium + charte graphique"
          required
        />
        <Textarea
          name="description"
          label="Description (optionnel)"
          placeholder="Décrivez ce qui est inclus dans cette offre…"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            name="amount"
            type="number"
            label="Montant (FCFA)"
            placeholder="25000"
            required
            min={500}
          />
          <Input
            name="deliveryDays"
            type="number"
            label="Délai (jours)"
            placeholder="5"
            required
            min={1}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            name="revisions"
            type="number"
            label="Révisions incluses"
            placeholder="2"
            min={0}
            defaultValue="1"
          />
          <Input
            name="expiresInDays"
            type="number"
            label="Expire dans (jours)"
            placeholder="7"
            min={1}
            defaultValue="7"
          />
        </div>

        <p className="text-xs text-gray-400">
          Le client recevra cette offre dans la conversation et pourra
          l&apos;accepter ou la refuser. L&apos;acceptation créera une commande en
          attente de paiement.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            <X className="mr-1 h-4 w-4" /> Annuler
          </Button>
          <Button
            type="submit"
            loading={loading}
            icon={<Send className="h-4 w-4" />}
          >
            Envoyer l&apos;offre
          </Button>
        </div>
      </form>
    </Modal>
  );
}
