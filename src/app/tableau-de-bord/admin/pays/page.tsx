import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { upsertCountry, toggleCountry, deleteCountry } from "@/lib/country-actions";
import { Globe, Plus, ToggleLeft, ToggleRight, Trash2, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPaysPage() {
  const countries = await prisma.countryConfig.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Configuration pays</h1>

      {/* Add country */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" /> Ajouter / modifier un pays
        </CardTitle>
        <form action={upsertCountry} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Code pays *</label>
            <input name="countryCode" required placeholder="CI" maxLength={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Nom FR *</label>
            <input name="nameFr" required placeholder="Côte d'Ivoire"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Nom EN *</label>
            <input name="nameEn" required placeholder="Ivory Coast"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Devise par défaut *</label>
            <input name="defaultCurrency" required placeholder="XOF" maxLength={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Devises (,)</label>
            <input name="currencies" placeholder="XOF"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Fournisseurs (,)</label>
            <input name="providers" placeholder="chariow,orange_money"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Fuseau horaire</label>
            <input name="timezone" placeholder="Africa/Abidjan"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Taxe label</label>
            <input name="taxLabel" placeholder="TVA"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Taxe (bps)</label>
            <input name="taxBps" type="number" placeholder="1800" min={0}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="primary" size="sm" className="w-full">Enregistrer</Button>
          </div>
        </form>
      </Card>

      {/* Countries list */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5" /> Pays configurés ({countries.length})
        </CardTitle>
        {countries.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Aucun pays configuré.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {countries.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
                      <MapPin className="h-3.5 w-3.5 text-primary-500" />
                      {c.countryCode}
                    </span>
                    <span className="text-sm text-gray-600">{c.nameFr}</span>
                    <span className="rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-700">
                      {c.defaultCurrency}
                    </span>
                    {c.active ? (
                      <span className="rounded-full bg-success-100 px-2 py-0.5 text-[10px] font-medium text-success-700">Actif</span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">Inactif</span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-gray-400">
                    {c.taxLabel && <span>{c.taxLabel} {(c.taxBps / 100).toFixed(1)}%</span>}
                    <span>{c.timezone}</span>
                    {c.providers.length > 0 && <span>· {c.providers.join(", ")}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={toggleCountry.bind(null, c.id)}>
                    <button type="submit">
                      {c.active ? (
                        <ToggleRight className="h-6 w-6 text-success-500 hover:text-success-700" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </form>
                  <form action={deleteCountry.bind(null, c.id)}>
                    <button type="submit" className="text-danger-400 hover:text-danger-600">
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
