import type { MetadataRoute } from "next";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let services: { slug: string; updatedAt: Date }[] = [];
  let categories: { slug: string }[] = [];

  if (hasDatabaseUrl()) {
    try {
      const pair = await Promise.all([
        prisma.service.findMany({
          where: { status: "PUBLISHED" },
          select: { slug: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.category.findMany({
          where: { parentId: null },
          select: { slug: true },
        }),
      ]);
      services = pair[0];
      categories = pair[1];
    } catch {
      /* build or DB indisponible : URLs dynamiques omises */
    }
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/services`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/recherche`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/statut`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${siteUrl}/aide/versions`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${siteUrl}/auth/connexion`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/auth/inscription`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/auth/inscription/vendeur`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/recherche?cat=${cat.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const servicePages: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${siteUrl}/services/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...servicePages];
}
