"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { auth } from "./auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireAdmin(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return null;
  return session.user.id;
}

export async function createBlogPost(formData: FormData): Promise<void> {
  const authorId = await requireAdmin();
  if (!authorId) return;

  const title = (formData.get("title") as string)?.trim();
  if (!title) return;

  const summary = (formData.get("summary") as string)?.trim() || null;
  const body = (formData.get("body") as string)?.trim() || "";
  const coverUrl = (formData.get("coverUrl") as string)?.trim() || null;
  const tagsRaw = (formData.get("tags") as string)?.trim() || "";
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const publish = formData.get("publish") === "on";

  let slug = slugify(title);
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  await prisma.blogPost.create({
    data: {
      slug,
      title,
      summary,
      body,
      coverUrl,
      authorId,
      tags,
      published: publish,
      publishedAt: publish ? new Date() : null,
    },
  });

  revalidatePath("/tableau-de-bord/admin/blog");
  revalidatePath("/blog");
}

export async function updateBlogPost(postId: string, formData: FormData): Promise<void> {
  const authorId = await requireAdmin();
  if (!authorId) return;

  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) return;

  const title = (formData.get("title") as string)?.trim() || post.title;
  const summary = (formData.get("summary") as string)?.trim() || null;
  const body = (formData.get("body") as string)?.trim() || post.body;
  const coverUrl = (formData.get("coverUrl") as string)?.trim() || null;
  const tagsRaw = (formData.get("tags") as string)?.trim() || "";
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const publish = formData.get("publish") === "on";

  const wasPublished = post.published;

  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      title,
      summary,
      body,
      coverUrl,
      tags,
      published: publish,
      publishedAt: publish && !wasPublished ? new Date() : post.publishedAt,
    },
  });

  revalidatePath("/tableau-de-bord/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
}

export async function toggleBlogPostPublish(postId: string): Promise<void> {
  const authorId = await requireAdmin();
  if (!authorId) return;

  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) return;

  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      published: !post.published,
      publishedAt: !post.published ? new Date() : post.publishedAt,
    },
  });

  revalidatePath("/tableau-de-bord/admin/blog");
  revalidatePath("/blog");
}

export async function deleteBlogPost(postId: string): Promise<void> {
  const authorId = await requireAdmin();
  if (!authorId) return;

  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) return;

  await prisma.blogPost.delete({ where: { id: postId } });

  revalidatePath("/tableau-de-bord/admin/blog");
  revalidatePath("/blog");
}
