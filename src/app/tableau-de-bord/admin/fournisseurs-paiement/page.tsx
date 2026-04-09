import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  upsertProvider, toggleProvider, deleteProvider,
} from "@/lib/payment-provider-actions";
import { CreditCard, Plus, ToggleLeft, ToggleRight, Trash2, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProvidersPage() {
  const providers = await prisma.paymentProvider.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Fournisseurs de paiement</h1>

      {/* Add provider */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" /> Ajouter / modifier un fournisseur
        </CardTitle>
        <form action={upsertProvider} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Slug *</label>
            <input name="slug" required placeholder="orange_money"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Nom FR *</label>
            <input name="nameFr" required placeholder="Orange Money"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Nom EN *</label>
            <input name="nameEn" required placeholder="Orange Money"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Devises (,)</label>
            <input name="currencies" placeholder="XOF,XAF"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Pays (,)</label>
            <input name="countries" placeholder="CI,SN,CM"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <Button type="submit" variant="primary" size="sm">Enregistrer</Button>
        </form>
      </Card>

      {/* Providers list */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" /> Fournisseurs ({providers.length})
        </CardTitle>
        {providers.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Aucun fournisseur configuré.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {providers.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-semibold text-gray-900">{p.slug}</code>
                    <span className="text-sm text-gray-500">{p.nameFr}</span>
                    {p.active ? (
                      <span className="rounded-full bg-success-100 px-2 py-0.5 text-[10px] font-medium text-success-700">Actif</span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">Inactif</span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.currencies.map((c) => (
                      <span key={c} className="rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-700">{c}</span>
                    ))}
                    {p.countries.map((c) => (
                      <span key={c} className="flex items-center gap-0.5 rounded bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                        <Globe className="h-2.5 w-2.5" />{c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={toggleProvider.bind(null, p.id)}>
                    <button type="submit" title={p.active ? "Désactiver" : "Activer"}>
                      {p.active ? (
                        <ToggleRight className="h-6 w-6 text-success-500 hover:text-success-700" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </form>
                  <form action={deleteProvider.bind(null, p.id)}>
                    <button type="submit" className="text-danger-400 hover:text-danger-600" title="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
