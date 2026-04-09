import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submitKyc } from "@/lib/kyc-actions";
import { BadgeCheck, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SellerKycPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/connexion");

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      kycStatus: true,
      kycSubmittedAt: true,
      kycNote: true,
      verifiedBadge: true,
    },
  });

  if (!profile) redirect("/tableau-de-bord/vendeur");

  const status = profile.kycStatus;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Vérification d&apos;identité (KYC)</h1>

      {/* Status card */}
      <Card className="flex items-start gap-4">
        {status === "VERIFIED" ? (
          <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-50">
              <BadgeCheck className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="font-semibold text-success-700">Identité vérifiée</p>
              <p className="mt-1 text-sm text-gray-500">
                Votre identité a été validée. Le badge vérifié est affiché sur votre profil.
              </p>
            </div>
          </>
        ) : status === "PENDING" ? (
          <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-50">
              <Clock className="h-5 w-5 text-warning-600" />
            </div>
            <div>
              <p className="font-semibold text-warning-700">Vérification en cours</p>
              <p className="mt-1 text-sm text-gray-500">
                Votre document a été soumis le{" "}
                {profile.kycSubmittedAt
                  ? new Date(profile.kycSubmittedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
                . Notre équipe l&apos;examine sous 48h.
              </p>
            </div>
          </>
        ) : status === "REJECTED" ? (
          <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-50">
              <AlertTriangle className="h-5 w-5 text-danger-600" />
            </div>
            <div>
              <p className="font-semibold text-danger-700">Vérification refusée</p>
              <p className="mt-1 text-sm text-gray-500">
                {profile.kycNote || "Votre demande a été refusée. Vous pouvez soumettre à nouveau."}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
              <ShieldCheck className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">Non vérifié</p>
              <p className="mt-1 text-sm text-gray-500">
                Vérifiez votre identité pour obtenir le badge de confiance et augmenter vos chances
                d&apos;être choisi par les clients.
              </p>
            </div>
          </>
        )}
      </Card>

      {/* Submission form */}
      {(status === "NONE" || status === "REJECTED") && (
        <Card>
          <CardTitle className="mb-4">Soumettre votre vérification</CardTitle>
          <form action={submitKyc} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Lien vers votre document d&apos;identité *
              </label>
              <input
                name="documentUrl"
                required
                type="url"
                placeholder="https://drive.google.com/..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">
                CNI, passeport ou permis de conduire. Hébergez-le sur Google Drive, Dropbox, etc.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Note complémentaire
              </label>
              <textarea
                name="note"
                rows={3}
                placeholder="Informations complémentaires (facultatif)"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <Button type="submit" variant="primary">
              Soumettre ma vérification
            </Button>
          </form>
        </Card>
      )}

      {/* Benefits */}
      <Card className="bg-primary-50 border-primary-100">
        <h3 className="mb-3 font-semibold text-primary-900">Avantages de la vérification</h3>
        <ul className="space-y-2 text-sm text-primary-700">
          <li className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
            Badge vérifié visible sur votre profil et vos services
          </li>
          <li className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
            Meilleur classement dans les résultats de recherche
          </li>
          <li className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
            Accès aux commandes de valeur élevée
          </li>
          <li className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
            Confiance accrue des clients
          </li>
        </ul>
      </Card>
    </div>
  );
}
