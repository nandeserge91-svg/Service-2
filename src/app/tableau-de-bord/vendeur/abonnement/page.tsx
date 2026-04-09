import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS, type PlanKey } from "@/lib/subscription-plans";
import { subscribeToPlan, cancelSubscription } from "@/lib/subscription-actions";
import { formatPrice } from "@/lib/utils";
import { Crown, CheckCircle, Zap, Star } from "lucide-react";

export const dynamic = "force-dynamic";

const PLAN_ICONS: Record<string, React.ElementType> = {
  FREE: Star,
  PRO: Zap,
  PREMIUM: Crown,
};

export default async function SellerSubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/connexion");

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) redirect("/tableau-de-bord/vendeur");

  const activeSub = await prisma.sellerSubscription.findFirst({
    where: { sellerProfileId: profile.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  const currentPlan = activeSub?.plan ?? "FREE";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Mon abonnement</h1>

      {activeSub && activeSub.plan !== "FREE" && (
        <Card className="flex items-center justify-between bg-primary-50 border-primary-100">
          <div>
            <p className="font-semibold text-primary-900">
              Plan actuel : {SUBSCRIPTION_PLANS[activeSub.plan as PlanKey].label}
            </p>
            {activeSub.endDate && (
              <p className="text-sm text-primary-700">
                Renouvellement le{" "}
                {new Date(activeSub.endDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          <form action={cancelSubscription}>
            <Button type="submit" variant="outline" size="sm" className="text-danger-600 hover:bg-danger-50">
              Annuler
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {(Object.entries(SUBSCRIPTION_PLANS) as [PlanKey, (typeof SUBSCRIPTION_PLANS)[PlanKey]][]).map(
          ([key, plan]) => {
            const Icon = PLAN_ICONS[key] ?? Star;
            const isCurrent = key === currentPlan;
            const isUpgrade = !isCurrent && key !== "FREE";

            return (
              <Card
                key={key}
                className={`flex flex-col ${isCurrent ? "ring-2 ring-primary-500" : ""}`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      key === "PREMIUM"
                        ? "bg-warning-50 text-warning-600"
                        : key === "PRO"
                          ? "bg-primary-50 text-primary-600"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{plan.label}</h3>
                    <p className="text-sm text-gray-500">
                      {plan.priceMinor > 0
                        ? `${formatPrice(plan.priceMinor, "XOF")} / mois`
                        : "Gratuit"}
                    </p>
                  </div>
                </div>

                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="rounded-lg bg-primary-50 py-2 text-center text-sm font-medium text-primary-700">
                    Plan actuel
                  </div>
                ) : isUpgrade ? (
                  <form action={subscribeToPlan.bind(null, key)}>
                    <Button type="submit" variant="primary" className="w-full">
                      Passer au {plan.label}
                    </Button>
                  </form>
                ) : (
                  <form action={subscribeToPlan.bind(null, key)}>
                    <Button type="submit" variant="outline" className="w-full">
                      Revenir au gratuit
                    </Button>
                  </form>
                )}
              </Card>
            );
          },
        )}
      </div>
    </div>
  );
}
