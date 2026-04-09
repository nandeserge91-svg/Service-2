import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/lib/coupon-actions";
import { formatPrice } from "@/lib/utils";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Gestion des coupons</h1>
      </div>

      {/* Create form */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" /> Nouveau coupon
        </CardTitle>
        <form action={createCoupon} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Code *</label>
            <input
              name="code"
              required
              placeholder="EX: BIENVENUE15"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <input
              name="description"
              placeholder="15% de réduction pour les nouveaux"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Réduction % (basis pts, 1500 = 15%)
            </label>
            <input
              name="discountBps"
              type="number"
              defaultValue="0"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Réduction fixe (minor)
            </label>
            <input
              name="discountFixed"
              type="number"
              defaultValue="0"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Devise (si fixe)</label>
            <input
              name="currency"
              placeholder="XOF"
              maxLength={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Commande minimum (minor)
            </label>
            <input
              name="minOrderMinor"
              type="number"
              defaultValue="0"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Utilisations max
            </label>
            <input
              name="maxUses"
              type="number"
              placeholder="Illimité"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date d&apos;expiration</label>
            <input
              name="validTo"
              type="datetime-local"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="primary" className="w-full">
              Créer le coupon
            </Button>
          </div>
        </form>
      </Card>

      {/* List */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5" /> Coupons existants ({coupons.length})
        </CardTitle>

        {coupons.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Aucun coupon créé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs font-medium text-gray-500 uppercase">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Réduction</th>
                  <th className="px-3 py-2">Utilisations</th>
                  <th className="px-3 py-2">Expire</th>
                  <th className="px-3 py-2">Actif</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="px-3 py-3">
                      <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium">
                        {c.code}
                      </span>
                      {c.description && (
                        <p className="mt-0.5 text-xs text-gray-400">{c.description}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {c.discountBps > 0 && <span>{c.discountBps / 100}%</span>}
                      {c.discountBps > 0 && c.discountFixed > 0 && " + "}
                      {c.discountFixed > 0 && (
                        <span>{formatPrice(c.discountFixed, c.currency ?? "XOF")}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {c._count.orders} / {c.maxUses ?? "∞"}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      {c.validTo
                        ? new Date(c.validTo).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <form action={toggleCoupon.bind(null, c.id, !c.active)}>
                        <button type="submit" title={c.active ? "Désactiver" : "Activer"}>
                          {c.active ? (
                            <ToggleRight className="h-5 w-5 text-success-500" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-gray-300" />
                          )}
                        </button>
                      </form>
                    </td>
                    <td className="px-3 py-3">
                      {c._count.orders === 0 && (
                        <form action={deleteCoupon.bind(null, c.id)}>
                          <button
                            type="submit"
                            className="text-danger-500 hover:text-danger-700"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
