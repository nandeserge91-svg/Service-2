export const SUBSCRIPTION_PLANS = {
  FREE: {
    label: "Gratuit",
    labelEn: "Free",
    priceMinor: BigInt(0),
    features: ["Profil vendeur", "Jusqu'à 5 services", "Commission standard"],
    featuresEn: ["Seller profile", "Up to 5 services", "Standard commission"],
  },
  PRO: {
    label: "Pro",
    labelEn: "Pro",
    priceMinor: BigInt(500000),
    features: [
      "Tout le plan Gratuit",
      "Services illimités",
      "Badge « Pro » sur le profil",
      "Priorité dans les résultats",
      "Commission réduite (-2%)",
    ],
    featuresEn: [
      "Everything in Free",
      "Unlimited services",
      "\"Pro\" badge on profile",
      "Priority in search results",
      "Reduced commission (-2%)",
    ],
  },
  PREMIUM: {
    label: "Premium",
    labelEn: "Premium",
    priceMinor: BigInt(1500000),
    features: [
      "Tout le plan Pro",
      "Services mis en avant",
      "Support prioritaire",
      "Analytics avancés",
      "Commission minimale (-5%)",
    ],
    featuresEn: [
      "Everything in Pro",
      "Featured services",
      "Priority support",
      "Advanced analytics",
      "Minimum commission (-5%)",
    ],
  },
} as const;

export type PlanKey = keyof typeof SUBSCRIPTION_PLANS;
