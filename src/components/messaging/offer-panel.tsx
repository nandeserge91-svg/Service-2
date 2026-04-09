"use client";

import { useEffect, useState, useCallback } from "react";
import { OfferCard, type OfferData } from "./offer-card";

interface Props {
  conversationId: string;
  refreshKey: number;
}

export function OfferPanel({ conversationId, refreshKey }: Props) {
  const [offers, setOffers] = useState<OfferData[]>([]);

  const fetchOffers = useCallback(() => {
    fetch(`/api/conversations/${conversationId}/offers`)
      .then((r) => r.json())
      .then((d) => setOffers(d.data ?? []))
      .catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers, refreshKey]);

  if (offers.length === 0) return null;

  return (
    <div className="space-y-3 border-b border-gray-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Offres ({offers.length})
      </p>
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} onUpdate={fetchOffers} />
      ))}
    </div>
  );
}
