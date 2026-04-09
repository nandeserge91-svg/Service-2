"use client";

import { useEffect, useState } from "react";
import { X, Wrench } from "lucide-react";

const STORAGE_KEY = "maintenance-banner-dismissed";

function isBannerEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_MAINTENANCE_BANNER?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function MaintenanceBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isBannerEnabled()) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* sessionStorage indisponible */
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  const message =
    process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE?.trim() ||
    "Une opération de maintenance est en cours ou prévue. Certains services peuvent être temporairement ralentis. Merci de votre patience.";

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div
      role="status"
      className="border-b border-warning-200 bg-warning-50 px-4 py-2.5 text-sm text-warning-900"
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3 sm:items-center">
        <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-warning-600 sm:mt-0" aria-hidden />
        <p className="min-w-0 flex-1 leading-relaxed">{message}</p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md p-1 text-warning-800 hover:bg-warning-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-warning-500"
          aria-label="Fermer la bannière"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
