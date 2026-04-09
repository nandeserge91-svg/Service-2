import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reviewReport, getReportStats } from "@/lib/report-actions";
import { Flag, CheckCircle, XCircle, AlertTriangle, Eye, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  OPEN: { bg: "bg-danger-100", text: "text-danger-700", label: "Ouvert" },
  REVIEWING: { bg: "bg-warning-100", text: "text-warning-700", label: "En examen" },
  RESOLVED: { bg: "bg-success-100", text: "text-success-700", label: "Résolu" },
  DISMISSED: { bg: "bg-gray-100", text: "text-gray-500", label: "Rejeté" },
};

export default async function AdminModerationPage() {
  const [reports, stats] = await Promise.all([
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        reporter: {
          select: {
            email: true,
            sellerProfile: { select: { displayName: true } },
            buyerProfile: { select: { displayName: true } },
          },
        },
      },
    }),
    getReportStats(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Modération & Signalements</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="text-center">
          <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-danger-500" />
          <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
          <p className="text-xs text-gray-500">Ouverts</p>
        </Card>
        <Card className="text-center">
          <Eye className="mx-auto mb-1 h-5 w-5 text-warning-500" />
          <p className="text-2xl font-bold text-gray-900">{stats.reviewing}</p>
          <p className="text-xs text-gray-500">En examen</p>
        </Card>
        <Card className="text-center">
          <CheckCircle className="mx-auto mb-1 h-5 w-5 text-success-500" />
          <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
          <p className="text-xs text-gray-500">Résolus</p>
        </Card>
        <Card className="text-center">
          <Flag className="mx-auto mb-1 h-5 w-5 text-primary-500" />
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </Card>
      </div>

      {/* SLA */}
      <Card className="bg-primary-50 border-primary-100">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary-600" />
          <div>
            <p className="text-sm font-semibold text-primary-900">SLA Support</p>
            <p className="text-xs text-primary-700">
              Objectif : traitement des signalements sous 48h. Litiges critiques sous 24h.
            </p>
          </div>
        </div>
      </Card>

      {/* Reports list */}
      <Card>
        <CardTitle className="mb-4">Signalements récents</CardTitle>
        {reports.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Aucun signalement.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {reports.map((r) => {
              const style = STATUS_STYLES[r.status] ?? STATUS_STYLES.OPEN;
              const reporterName =
                r.reporter.sellerProfile?.displayName ??
                r.reporter.buyerProfile?.displayName ??
                r.reporter.email;
              return (
                <div key={r.id} className="py-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                        <span className="text-xs font-medium text-gray-600">
                          {r.targetType} #{r.targetId.slice(0, 8)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-900">{r.reason}</p>
                      {r.details && (
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{r.details}</p>
                      )}
                      <p className="mt-1 text-[10px] text-gray-400">
                        Par {reporterName} · {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    {(r.status === "OPEN" || r.status === "REVIEWING") && (
                      <div className="flex items-center gap-2">
                        <form action={reviewReport.bind(null, r.id, "RESOLVED", undefined)}>
                          <button
                            type="submit"
                            className="flex items-center gap-1 rounded-lg bg-success-50 px-3 py-1.5 text-xs font-medium text-success-700 hover:bg-success-100"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Résoudre
                          </button>
                        </form>
                        <form action={reviewReport.bind(null, r.id, "DISMISSED", undefined)}>
                          <button
                            type="submit"
                            className="flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Rejeter
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
