import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { APP_NAME } from "@/lib/constants";
import { CalendarDays, Tag, ArrowLeft } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, summary: true },
  });
  if (!post) return { title: "Article introuvable" };
  return {
    title: post.title,
    description: post.summary || `${post.title} — Blog ${APP_NAME}`,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          sellerProfile: { select: { displayName: true } },
          buyerProfile: { select: { displayName: true } },
        },
      },
    },
  });

  if (!post || !post.published) notFound();

  const authorName =
    post.author.sellerProfile?.displayName ??
    post.author.buyerProfile?.displayName ??
    "Rédaction";

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs
        items={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
      />

      {post.coverUrl && (
        <div className="mb-8 overflow-hidden rounded-2xl">
          <img src={post.coverUrl} alt="" className="w-full object-cover" />
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-4xl">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span>{authorName}</span>
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
        </div>
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-gray max-w-none">
        {post.body.split("\n").map((paragraph, i) => {
          if (!paragraph.trim()) return <br key={i} />;
          if (paragraph.startsWith("## "))
            return (
              <h2 key={i} className="mt-8 mb-4 text-xl font-bold text-gray-900">
                {paragraph.replace("## ", "")}
              </h2>
            );
          if (paragraph.startsWith("### "))
            return (
              <h3 key={i} className="mt-6 mb-3 text-lg font-semibold text-gray-900">
                {paragraph.replace("### ", "")}
              </h3>
            );
          if (paragraph.startsWith("- "))
            return (
              <li key={i} className="ml-4 text-gray-600">
                {paragraph.replace("- ", "")}
              </li>
            );
          return (
            <p key={i} className="mb-4 leading-relaxed text-gray-600">
              {paragraph}
            </p>
          );
        })}
      </div>

      <div className="mt-12 border-t border-gray-100 pt-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au blog
        </Link>
      </div>
    </article>
  );
}
