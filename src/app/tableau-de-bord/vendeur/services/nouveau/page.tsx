"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardTitle } from "@/components/ui/card";
import { createService } from "@/lib/service-actions";

interface Category {
  id: string;
  slug: string;
  nameFr: string;
  parentId: string | null;
}

export default function NewServicePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data ?? []))
      .catch(() => {});
  }, []);

  const parents = categories.filter((c) => !c.parentId);
  const getChildren = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await createService(form);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/tableau-de-bord/vendeur/services");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nouveau service</h1>

      {error && (
        <div className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations */}
        <Card>
          <CardTitle className="mb-4">Informations générales</CardTitle>
          <div className="space-y-4">
            <Input
              name="title"
              label="Titre du service"
              placeholder="Ex : Création de logo professionnel"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Catégorie
              </label>
              <select
                name="categoryId"
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-base text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              >
                <option value="">Choisir une catégorie</option>
                {parents.map((p) => (
                  <optgroup key={p.id} label={p.nameFr}>
                    {getChildren(p.id).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameFr}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <Textarea
              name="summary"
              label="Description"
              placeholder="Décrivez votre service en détail…"
              hint="Soyez précis pour aider les clients à comprendre ce que vous proposez."
            />
          </div>
        </Card>

        {/* Package basique */}
        <Card>
          <CardTitle className="mb-4">Offre de base</CardTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="pkgTitle"
              label="Nom de l'offre"
              placeholder="Ex : Logo simple"
              required
            />
            <Input
              name="pkgPrice"
              type="number"
              label="Prix (FCFA)"
              placeholder="15000"
              required
              min={500}
            />
            <Input
              name="pkgDays"
              type="number"
              label="Délai de livraison (jours)"
              placeholder="3"
              required
              min={1}
            />
            <Input
              name="pkgRevisions"
              type="number"
              label="Révisions incluses"
              placeholder="1"
              min={0}
            />
          </div>
          <div className="mt-4">
            <Textarea
              name="pkgDescription"
              label="Description de l'offre"
              placeholder="Ce qui est inclus dans cette offre…"
            />
          </div>
        </Card>

        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="submit"
            variant="outline"
            loading={loading}
            icon={<Save className="h-4 w-4" />}
          >
            Enregistrer en brouillon
          </Button>
          <Button
            type="submit"
            name="publish"
            value="true"
            loading={loading}
            icon={<Send className="h-4 w-4" />}
          >
            Publier le service
          </Button>
        </div>
      </form>
    </div>
  );
}
