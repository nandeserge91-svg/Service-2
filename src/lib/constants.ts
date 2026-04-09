export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Marketplace";

export const DEFAULT_LOCALE = "fr";

export const DEFAULT_CURRENCY = "XOF";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "En attente de paiement",
  PAID: "Payée",
  IN_PROGRESS: "En cours",
  DELIVERED: "Livrée",
  REVISION_REQUESTED: "Révision demandée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  DISPUTED: "En litige",
};

export const ORDER_STATUS_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  PENDING_PAYMENT: {
    bg: "bg-warning-50",
    text: "text-warning-600",
    dot: "bg-warning-500",
  },
  PAID: {
    bg: "bg-primary-50",
    text: "text-primary-600",
    dot: "bg-primary-500",
  },
  IN_PROGRESS: {
    bg: "bg-primary-50",
    text: "text-primary-700",
    dot: "bg-primary-600",
  },
  DELIVERED: {
    bg: "bg-success-50",
    text: "text-success-700",
    dot: "bg-success-500",
  },
  REVISION_REQUESTED: {
    bg: "bg-warning-50",
    text: "text-warning-600",
    dot: "bg-warning-500",
  },
  COMPLETED: {
    bg: "bg-success-50",
    text: "text-success-700",
    dot: "bg-success-600",
  },
  CANCELLED: {
    bg: "bg-gray-100",
    text: "text-gray-500",
    dot: "bg-gray-400",
  },
  DISPUTED: {
    bg: "bg-danger-50",
    text: "text-danger-700",
    dot: "bg-danger-500",
  },
};

export const CATEGORIES_ICONS: Record<string, string> = {
  design: "🎨",
  developpement: "💻",
  redaction: "📝",
  business: "📊",
  audio: "🎶",
  photo: "📸",
  video: "🎬",
  marketing: "📣",
  formation: "🎓",
  traduction: "🌍",
};
