import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createBlogPost, toggleBlogPostPublish, deleteBlogPost } from "@/lib/blog-actions";
import { Plus, Eye, EyeOff, Trash2, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { email: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Gestion du blog</h1>

      {/* Create form */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" /> Nouvel article
        </CardTitle>
        <form action={createBlogPost} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Titre *</label>
              <input
                name="title"
                required
                placeholder="Mon premier article"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Image de couverture (URL)
              </label>
              <input
                name="coverUrl"
                type="url"
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Résumé</label>
            <input
              name="summary"
              placeholder="Résumé court affiché dans la liste"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contenu (Markdown) *
            </label>
            <textarea
              name="body"
              required
              rows={8}
              placeholder="Rédigez votre article en Markdown…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tags (séparés par des virgules)
              </label>
              <input
                name="tags"
                placeholder="actualité, tutoriel, design"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="publish" className="rounded border-gray-300" />
                Publier immédiatement
              </label>
            </div>
          </div>
          <Button type="submit" variant="primary">
            Créer l&apos;article
          </Button>
        </form>
      </Card>

      {/* Articles list */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" /> Articles ({posts.length})
        </CardTitle>

        {posts.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Aucun article.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {posts.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{p.title}</p>
                  <p className="text-xs text-gray-500">
                    {p.author.email} ·{" "}
                    {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                    {p.published && p.publishedAt && (
                      <> · Publié le {new Date(p.publishedAt).toLocaleDateString("fr-FR")}</>
                    )}
                  </p>
                  {p.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      p.published
                        ? "bg-success-100 text-success-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {p.published ? "Publié" : "Brouillon"}
                  </span>
                  <form action={toggleBlogPostPublish.bind(null, p.id)}>
                    <button type="submit" title={p.published ? "Dépublier" : "Publier"}>
                      {p.published ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-success-500 hover:text-success-700" />
                      )}
                    </button>
                  </form>
                  <form action={deleteBlogPost.bind(null, p.id)}>
                    <button type="submit" className="text-danger-500 hover:text-danger-700" title="Supprimer">
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
