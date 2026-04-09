import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardTitle } from "@/components/ui/card";
import { ensureReferralCode, getReferralStats } from "@/lib/referral-actions";
import { formatPrice } from "@/lib/utils";
import { Gift, Users, CheckCircle, Copy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientReferralPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/connexion");

  const code = await ensureReferralCode();
  const stats = await getReferralStats(session.user.id);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/inscription?ref=${code}`;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Parrainage</h1>

      {/* Referral code card */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 sm:mb-0">
            <Gift className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-primary-900">Invitez vos amis</h2>
            <p className="mt-1 text-sm text-primary-700">
              Partagez votre code de parrainage. Quand un filleul effectue sa première commande,
              vous recevez un bonus !
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-4 py-2">
                <span className="font-mono text-lg font-bold tracking-widest text-primary-800">
                  {code ?? "—"}
                </span>
                <Copy className="h-4 w-4 text-primary-400" />
              </div>
              <p className="text-xs text-primary-600 break-all">{shareUrl}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <Users className="mx-auto mb-2 h-6 w-6 text-primary-500" />
          <p className="text-2xl font-bold text-gray-900">{stats.totalReferred}</p>
          <p className="text-xs text-gray-500">Filleuls inscrits</p>
        </Card>
        <Card className="text-center">
          <CheckCircle className="mx-auto mb-2 h-6 w-6 text-success-500" />
          <p className="text-2xl font-bold text-gray-900">{stats.totalCredited}</p>
          <p className="text-xs text-gray-500">Bonus crédités</p>
        </Card>
        <Card className="text-center">
          <Gift className="mx-auto mb-2 h-6 w-6 text-warning-500" />
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(stats.totalCreditMinor, "XOF")}
          </p>
          <p className="text-xs text-gray-500">Total gagné</p>
        </Card>
      </div>

      {/* Referral history */}
      <Card>
        <CardTitle className="mb-4">Historique des parrainages</CardTitle>
        {stats.referrals.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            Aucun parrainage pour le moment. Partagez votre code !
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs font-medium text-gray-500 uppercase">
                <tr>
                  <th className="px-3 py-2">Filleul</th>
                  <th className="px-3 py-2">Inscription</th>
                  <th className="px-3 py-2">Bonus</th>
                  <th className="px-3 py-2">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.referrals.map((r) => {
                  const name =
                    r.referred.buyerProfile?.displayName ??
                    r.referred.sellerProfile?.displayName ??
                    "Utilisateur";
                  return (
                    <tr key={r.id}>
                      <td className="px-3 py-3 font-medium text-gray-900">{name}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">
                        {new Date(r.referred.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {formatPrice(r.creditMinor, r.currency)}
                      </td>
                      <td className="px-3 py-3">
                        {r.credited ? (
                          <span className="inline-block rounded-full bg-success-100 px-2 py-0.5 text-[10px] font-medium text-success-700">
                            Crédité
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-warning-100 px-2 py-0.5 text-[10px] font-medium text-warning-700">
                            En attente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
