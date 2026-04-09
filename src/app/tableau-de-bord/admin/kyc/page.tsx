import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reviewKyc } from "@/lib/kyc-actions";
import { BadgeCheck, XCircle, Clock, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-warning-100 text-warning-700" },
  VERIFIED: { label: "Vérifié", color: "bg-success-100 text-success-700" },
  REJECTED: { label: "Refusé", color: "bg-danger-100 text-danger-700" },
  NONE: { label: "Non soumis", color: "bg-gray-100 text-gray-500" },
};

export default async function AdminKycPage() {
  const profiles = await prisma.sellerProfile.findMany({
    where: { kycStatus: { not: "NONE" } },
    orderBy: [{ kycSubmittedAt: "desc" }],
    select: {
      id: true,
      displayName: true,
      kycStatus: true,
      kycSubmittedAt: true,
      kycDocumentUrl: true,
      kycNote: true,
      verifiedBadge: true,
      countryCode: true,
      user: { select: { email: true } },
    },
  });

  const pending = profiles.filter((p) => p.kycStatus === "PENDING");
  const reviewed = profiles.filter((p) => p.kycStatus !== "PENDING");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Vérification KYC vendeurs</h1>

      {/* Pending */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-warning-500" />
          En attente de vérification ({pending.length})
        </CardTitle>

        {pending.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            Aucune demande en attente.
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {pending.map((p) => (
              <div key={p.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{p.displayName}</p>
                  <p className="text-xs text-gray-500">
                    {p.user.email} · {p.countryCode} · Soumis le{" "}
                    {p.kycSubmittedAt
                      ? new Date(p.kycSubmittedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                  {p.kycNote && (
                    <p className="mt-1 text-xs text-gray-400 italic">Note : {p.kycNote}</p>
                  )}
                  {p.kycDocumentUrl && (
                    <a
                      href={p.kycDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Voir le document
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <form action={reviewKyc.bind(null, p.id, "VERIFIED", undefined)}>
                    <Button type="submit" variant="primary" size="sm" className="gap-1">
                      <BadgeCheck className="h-4 w-4" /> Valider
                    </Button>
                  </form>
                  <form action={reviewKyc.bind(null, p.id, "REJECTED", "Documents insuffisants")}>
                    <Button type="submit" variant="outline" size="sm" className="gap-1 text-danger-600 hover:bg-danger-50">
                      <XCircle className="h-4 w-4" /> Refuser
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* History */}
      <Card>
        <CardTitle className="mb-4">Historique des vérifications ({reviewed.length})</CardTitle>
        {reviewed.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Aucun historique.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs font-medium text-gray-500 uppercase">
                <tr>
                  <th className="px-3 py-2">Vendeur</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reviewed.map((p) => {
                  const st = STATUS_LABELS[p.kycStatus] ?? STATUS_LABELS.NONE;
                  return (
                    <tr key={p.id}>
                      <td className="px-3 py-3 font-medium text-gray-900">{p.displayName}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{p.user.email}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500">
                        {p.kycSubmittedAt
                          ? new Date(p.kycSubmittedAt).toLocaleDateString("fr-FR")
                          : "—"}
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
