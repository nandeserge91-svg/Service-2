"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportTransactionsCSV, exportCommissionsCSV } from "@/lib/export-actions";
import { Download, FileSpreadsheet, Receipt } from "lucide-react";

function downloadCSV(content: string, filename: string) {
  const bom = "\uFEFF";
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminExportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleExport(type: "transactions" | "commissions") {
    setLoading(type);
    try {
      const fn = type === "transactions" ? exportTransactionsCSV : exportCommissionsCSV;
      const csv = await fn(from || undefined, to || undefined);
      if (csv) {
        const date = new Date().toISOString().slice(0, 10);
        downloadCSV(csv, `${type}_${date}.csv`);
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Exports comptables</h1>

      <Card>
        <CardTitle className="mb-4">Période</CardTitle>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Du</label>
            <input
              type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Au</label>
            <input
              type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-400">Laissez vide pour tout exporter (max 10 000 lignes).</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Transactions</p>
              <p className="text-xs text-gray-500">
                Toutes les commandes avec montants, statuts et paiements.
              </p>
            </div>
          </div>
          <Button
            variant="primary" size="sm"
            onClick={() => handleExport("transactions")}
            disabled={loading !== null}
          >
            <Download className="mr-1.5 h-4 w-4" />
            {loading === "transactions" ? "Export en cours…" : "Télécharger CSV"}
          </Button>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Commissions</p>
              <p className="text-xs text-gray-500">
                Commandes complétées avec détail commissions et taux.
              </p>
            </div>
          </div>
          <Button
            variant="primary" size="sm"
            onClick={() => handleExport("commissions")}
            disabled={loading !== null}
          >
            <Download className="mr-1.5 h-4 w-4" />
            {loading === "commissions" ? "Export en cours…" : "Télécharger CSV"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
