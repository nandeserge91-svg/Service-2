"use client";

import {
  CreditCard, Play, Package, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  status: string;
  note: string | null;
  createdAt: string | Date;
}

const statusMeta: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PENDING_PAYMENT: { label: "Commande créée", icon: CreditCard, color: "text-gray-500 bg-gray-100" },
  PAID: { label: "Paiement reçu", icon: CreditCard, color: "text-success-600 bg-success-50" },
  IN_PROGRESS: { label: "En cours", icon: Play, color: "text-primary-600 bg-primary-50" },
  DELIVERED: { label: "Livré", icon: Package, color: "text-primary-600 bg-primary-50" },
  REVISION_REQUESTED: { label: "Révision demandée", icon: RefreshCw, color: "text-warning-600 bg-warning-50" },
  COMPLETED: { label: "Terminé", icon: CheckCircle, color: "text-success-600 bg-success-50" },
  CANCELLED: { label: "Annulé", icon: XCircle, color: "text-danger-600 bg-danger-50" },
  DISPUTED: { label: "Litige", icon: AlertTriangle, color: "text-danger-600 bg-danger-50" },
};

function formatDate(dateStr: string | Date) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderTimeline({ events }: { events: Event[] }) {
  if (events.length === 0) return null;

  return (
    <div className="space-y-0">
      {events.map((event, i) => {
        const meta = statusMeta[event.status] ?? {
          label: event.status,
          icon: Clock,
          color: "text-gray-500 bg-gray-100",
        };
        const isLast = i === events.length - 1;

        return (
          <div key={event.id} className="flex gap-3">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", meta.color)}>
                <meta.icon className="h-4 w-4" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-gray-200" />}
            </div>

            {/* Content */}
            <div className={cn("pb-5", isLast && "pb-0")}>
              <p className="text-sm font-medium text-gray-900">{meta.label}</p>
              {event.note && (
                <p className="mt-0.5 text-sm text-gray-500">{event.note}</p>
              )}
              <p className="mt-0.5 text-xs text-gray-400">{formatDate(event.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
