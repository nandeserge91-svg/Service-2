import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  createFeatureFlag,
  toggleFeatureFlag,
  deleteFeatureFlag,
} from "@/lib/flag-actions";
import { ToggleLeft, ToggleRight, Plus, Trash2, Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminFeatureFlagsPage() {
  const flags = await prisma.featureFlag.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Feature Flags</h1>

      {/* Create form */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" /> Nouveau flag
        </CardTitle>
        <form action={createFeatureFlag} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Clé *</label>
            <input
              name="key"
              required
              placeholder="BETA_NEW_FEATURE"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-700">Description</label>
            <input
              name="description"
              placeholder="Description optionnelle"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="enabled" className="rounded border-gray-300" />
            Actif
          </label>
          <Button type="submit" variant="primary" size="sm">
            Créer
          </Button>
        </form>
      </Card>

      {/* Flags list */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" /> Flags ({flags.length})
        </CardTitle>

        {flags.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            Aucun feature flag. Les flags env (FEATURE_*) restent actifs.
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {flags.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-semibold text-gray-900">{f.key}</code>
                    {f.enabled ? (
                      <span className="rounded-full bg-success-100 px-2 py-0.5 text-[10px] font-medium text-success-700">
                        ON
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                        OFF
                      </span>
                    )}
                  </div>
                  {f.description && (
                    <p className="mt-0.5 text-xs text-gray-500">{f.description}</p>
                  )}
                  <p className="text-[10px] text-gray-400">
                    Mis à jour {new Date(f.updatedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={toggleFeatureFlag.bind(null, f.id)}>
                    <button type="submit" title={f.enabled ? "Désactiver" : "Activer"}>
                      {f.enabled ? (
                        <ToggleRight className="h-6 w-6 text-success-500 hover:text-success-700" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </form>
                  <form action={deleteFeatureFlag.bind(null, f.id)}>
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
