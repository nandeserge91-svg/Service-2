import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import type { AuditAction, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const ACTION_COLORS: Record<string, "primary" | "success" | "warning" | "default"> = {
  DISPUTE_OPENED: "warning",
  DISPUTE_RESOLVED: "success",
  WITHDRAWAL_APPROVED: "success",
  ADMIN_OVERRIDE: "primary",
};

interface SearchParams {
  page?: string;
  action?: string;
}

export default async function AdminAuditPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const actionFilter = searchParams.action as AuditAction | undefined;
  const pageSize = 40;

  const where: Prisma.AuditLogWhereInput = actionFilter ? { action: actionFilter } : {};

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        actor: { select: { email: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const distinctActions = await prisma.auditLog.findMany({
    distinct: ["action"],
    select: { action: true },
    orderBy: { action: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Journal d&apos;audit</h1>
        <p className="mt-1 text-sm text-gray-500">{total} événements enregistrés</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href="/tableau-de-bord/admin/audit"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !actionFilter ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Tous
        </a>
        {distinctActions.map((a) => (
          <a
            key={a.action}
            href={`/tableau-de-bord/admin/audit?action=${a.action}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              actionFilter === a.action
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {a.action}
          </a>
        ))}
      </div>

      <Card padding="none">
        {logs.length === 0 && (
          <div className="px-6 py-12 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">Aucun événement</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Acteur</th>
                <th className="px-5 py-3 font-medium">Entité</th>
                <th className="px-5 py-3 font-medium">Détails</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 last:border-b-0">
                  <td className="whitespace-nowrap px-5 py-3 text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    {new Date(log.createdAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={ACTION_COLORS[log.action] ?? "default"}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {log.actor?.email ?? "système"}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {log.entity} <span className="text-gray-300">·</span>{" "}
                    <span className="font-mono text-[10px]">{log.entityId.slice(0, 12)}</span>
                  </td>
                  <td className="px-5 py-3">
                    {log.payload && (
                      <code className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-500">
                        {JSON.stringify(log.payload).slice(0, 80)}
                      </code>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <p className="text-xs text-gray-400">
              Page {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`/tableau-de-bord/admin/audit?page=${page - 1}${actionFilter ? `&action=${actionFilter}` : ""}`}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
                >
                  ← Précédent
                </a>
              )}
              {page < totalPages && (
                <a
                  href={`/tableau-de-bord/admin/audit?page=${page + 1}${actionFilter ? `&action=${actionFilter}` : ""}`}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
                >
                  Suivant →
                </a>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
