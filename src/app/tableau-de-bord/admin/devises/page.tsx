import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  upsertCurrency, toggleCurrency,
  upsertExchangeRate, getExchangeRates,
} from "@/lib/currency-actions";
import { DollarSign, ArrowRightLeft, Plus, ToggleLeft, ToggleRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDevisesPage() {
  const [currencies, rates] = await Promise.all([
    prisma.supportedCurrency.findMany({ orderBy: { sortOrder: "asc" } }),
    getExchangeRates(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Devises & taux de change</h1>

      {/* Add currency */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" /> Ajouter / modifier une devise
        </CardTitle>
        <form action={upsertCurrency} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Code *</label>
            <input name="code" required placeholder="XOF" maxLength={3}
              className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Symbole *</label>
            <input name="symbol" required placeholder="FCFA"
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Nom FR *</label>
            <input name="nameFr" required placeholder="Franc CFA"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Nom EN *</label>
            <input name="nameEn" required placeholder="CFA Franc"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Décimales</label>
            <input name="decimals" type="number" defaultValue={0} min={0} max={4}
              className="w-16 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <Button type="submit" variant="primary" size="sm">Enregistrer</Button>
        </form>
      </Card>

      {/* Currencies list */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" /> Devises ({currencies.length})
        </CardTitle>
        {currencies.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Aucune devise configurée.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {currencies.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <span className="text-sm font-bold text-gray-900">{c.code}</span>
                  <span className="ml-2 text-sm text-gray-500">{c.symbol} — {c.nameFr}</span>
                  {!c.active && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                      Inactif
                    </span>
                  )}
                </div>
                <form action={toggleCurrency.bind(null, c.id)}>
                  <button type="submit" title={c.active ? "Désactiver" : "Activer"}>
                    {c.active ? (
                      <ToggleRight className="h-6 w-6 text-success-500 hover:text-success-700" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Exchange rates */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" /> Taux de change
        </CardTitle>
        <form action={upsertExchangeRate} className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Base *</label>
            <input name="baseCurrency" required placeholder="XOF" maxLength={3}
              className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Cible *</label>
            <input name="currency" required placeholder="EUR" maxLength={3}
              className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Taux (1 base = ? cible) *</label>
            <input name="rate" required type="number" step="any" placeholder="0.00152"
              className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <Button type="submit" variant="primary" size="sm">Enregistrer</Button>
        </form>

        {rates.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">Aucun taux enregistré.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {rates.map((r) => (
              <div key={r.id} className="flex items-center gap-4 py-2 text-sm">
                <span className="font-medium text-gray-900">
                  1 {r.baseCurrency} = {r.rate.toFixed(6)} {r.currency}
                </span>
                <span className="text-xs text-gray-400">
                  Depuis {new Date(r.validFrom).toLocaleDateString("fr-FR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
