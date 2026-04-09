"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { auth } from "./auth";

export async function submitReport(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const targetType = (formData.get("targetType") as string)?.trim();
  const targetId = (formData.get("targetId") as string)?.trim();
  const reason = (formData.get("reason") as string)?.trim();
  const details = (formData.get("details") as string)?.trim() || null;

  if (!targetType || !targetId || !reason) return;

  await prisma.report.create({
    data: {
      reporterUserId: session.user.id,
      targetType,
      targetId,
      reason,
      details,
    },
  });
}

export async function reviewReport(
  reportId: string,
  decision: "RESOLVED" | "DISMISSED",
  adminNote?: string,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) return;

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: decision,
      adminNote: adminNote || null,
      resolvedAt: new Date(),
    },
  });

  revalidatePath("/tableau-de-bord/admin/moderation");
}

export async function getReportStats() {
  const [open, reviewing, total] = await Promise.all([
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.report.count({ where: { status: "REVIEWING" } }),
    prisma.report.count(),
  ]);
  return { open, reviewing, total, resolved: total - open - reviewing };
}
