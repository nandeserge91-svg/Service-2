import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserAdminActions } from "@/components/admin/user-admin-actions";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      roleAssignments: { select: { role: true } },
      sellerProfile: { select: { displayName: true } },
      buyerProfile: { select: { displayName: true } },
      _count: { select: { buyerOrders: true, sellerOrders: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="mt-1 text-sm text-gray-500">{users.length} utilisateurs inscrits</p>
        </div>
      </div>

      <Card padding="none">
        {users.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">Aucun utilisateur</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Utilisateur</th>
                <th className="px-5 py-3 font-medium">Rôles</th>
                <th className="px-5 py-3 font-medium">Commandes</th>
                <th className="px-5 py-3 font-medium">Inscrit le</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const name =
                  u.sellerProfile?.displayName ??
                  u.buyerProfile?.displayName ??
                  u.email.split("@")[0];
                const roles = u.roleAssignments.map((r) => r.role);
                const isSuspended = u.locale === "suspended";
                const orderCount = u._count.buyerOrders + u._count.sellerOrders;

                return (
                  <tr key={u.id} className="border-b border-gray-50 last:border-b-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={name} src={u.image} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{name}</p>
                          <p className="truncate text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {roles.map((r) => (
                          <Badge
                            key={r}
                            variant={r === "ADMIN" ? "primary" : r === "SELLER" ? "success" : "default"}
                            className="text-[10px]"
                          >
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{orderCount}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      {isSuspended ? (
                        <Badge variant="warning">Suspendu</Badge>
                      ) : (
                        <Badge variant="success">Actif</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <UserAdminActions userId={u.id} isSuspended={isSuspended} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
