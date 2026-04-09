"use client";

import { useEffect, useState } from "react";
import { Activity, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type HealthBody = {
  status: string;
  timestamp: string;
  version: string;
  checks: { database: boolean };
};

type Props = {
  /** Page publique Better Stack, Statuspage.io, etc. */
  externalStatusUrl?: string;
};

export function StatusPanel({ externalStatusUrl }: Props) {
  const [data, setData] = useState<HealthBody | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const json = (await res.json()) as HealthBody;
      setData(json);
      if (!res.ok) {
        setError("Le serveur répond mais un composant critique est indisponible.");
      }
    } catch {
      setData(null);
      setError("Impossible de joindre l’API de statut. Réessayez dans quelques instants.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const dbOk = data?.checks.database === true;
  const appOk = data?.status === "ok";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
        {data?.timestamp && (
          <span className="text-xs text-gray-500">
            Dernière vérification : {new Date(data.timestamp).toLocaleString("fr-FR")}
          </span>
        )}
      </div>

      {error && !data && (
        <Card className="border-danger-200 bg-danger-50 p-4 text-sm text-danger-800">{error}</Card>
      )}

      {error && data && (
        <Card className="border-warning-200 bg-warning-50 p-4 text-sm text-warning-900">{error}</Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                appOk ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"
              }`}
            >
              <Activity className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Application</p>
              <p className="text-sm text-gray-600">
                {loading && !data ? "Vérification…" : appOk ? "Opérationnelle" : "Dégradée"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                dbOk ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"
              }`}
            >
              <Database className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Base de données</p>
              <p className="text-sm text-gray-600">
                {loading && !data ? "Vérification…" : dbOk ? "Accessible" : "Indisponible"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {data && (
        <p className="text-xs text-gray-500">
          Version déployée (package) : <span className="font-mono text-gray-700">{data.version}</span>
          {process.env.NEXT_PUBLIC_APP_RELEASE_LABEL?.trim() ? (
            <>
              {" "}
              · Gel / release :{" "}
              <span className="font-mono text-gray-700">
                {process.env.NEXT_PUBLIC_APP_RELEASE_LABEL.trim()}
              </span>
            </>
          ) : null}
        </p>
      )}

      {externalStatusUrl ? (
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">Historique & incidents : </span>
          <a
            href={externalStatusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary-600 underline-offset-2 hover:text-primary-700 hover:underline"
          >
            page de statut détaillée
          </a>
          .
        </p>
      ) : null}

      <p className="text-sm text-gray-600">
        Ces indicateurs reflètent l’état au moment de la requête. Pour une surveillance continue, les équipes
        techniques peuvent interroger <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">GET /api/health</code>{" "}
        (réponse JSON, code HTTP 200 ou 503).
      </p>
    </div>
  );
}
