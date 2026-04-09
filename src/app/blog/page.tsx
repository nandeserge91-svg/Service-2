import type { Metadata } from "next";
import Link from "next/link";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { APP_NAME } from "@/lib/constants";
import { CalendarDays, Tag, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: `Actualités, tutoriels et conseils de la communauté ${APP_NAME}.`,
};

export default async function BlogPage() {
  let posts: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    coverUrl: string | null;
    tags: string[];
    publishedAt: Date | null;
    author: { sellerProfile: { displayName: string } | null; buyerProfile: { displayName: string | null } | null };
  }[] = [];

  if (hasDatabaseUrl()) {
    try {
      posts = await prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          coverUrl: true,
          tags: true,
          publishedAt: true,
          author: {
            select: {
              sellerProfile: { select: { displayName: true } },
              buyerProfile: { select: { displayName: true } },
            },
          },
        },
      });
    } catch {
      /* DB unavailable */
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs items={[{ label: "Blog" }]} />
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Blog</h1>
        <p className="mt-2 text-gray-500">
          Actualités, tutoriels et conseils pour réussir sur {APP_NAME}.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">
          Aucun article publié pour le moment.
        </p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const authorName =
              post.author.sellerProfile?.displayName ??
              post.author.buyerProfile?.displayName ??
              "Rédaction";
            return (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card hover className="flex flex-col gap-4 sm:flex-row">
                  {post.coverUrl ? (
                    <div className="h-40 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-auto sm:w-48">
                      <img
                        src={post.coverUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 w-full shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-gray-100 sm:h-auto sm:w-48">
                      <span className="text-4xl text-gray-200">📝</span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col">
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-primary-600">
                      {post.title}
                    </h2>
                    {post.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{post.summary}</p>
                    )}
                    <div className="mt-auto flex flex-wrap items-center gap-3 pt-3 text-xs text-gray-400">
                      <span>{authorName}</span>
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      {post.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {post.tags.slice(0, 3).join(", ")}
                        </span>
                      )}
                      <ArrowRight className="ml-auto h-4 w-4 text-primary-400" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
