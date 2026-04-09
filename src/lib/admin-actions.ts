"use server";

import { auth } from "./auth";
import { prisma } from "./prisma";
import * as audit from "./audit";

interface ActionResult {
  success?: boolean;
  error?: string;
}

async function requireAdmin(): Promise<string | ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };
  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN") && !roles.includes("SUPPORT")) {
    return { error: "Accès refusé." };
  }
  return session.user.id;
}

// ——— User management ———

export async function suspendUser(userId: string): Promise<ActionResult> {
  const actorId = await requireAdmin();
  if (typeof actorId !== "string") return actorId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Utilisateur introuvable." };

  await prisma.user.update({
    where: { id: userId },
    data: { locale: "suspended" },
  });

  audit.log({
    actorId,
    action: "ADMIN_OVERRIDE",
    entity: "User",
    entityId: userId,
    payload: { action: "suspend" },
  });

  return { success: true };
}

export async function activateUser(userId: string): Promise<ActionResult> {
  const actorId = await requireAdmin();
  if (typeof actorId !== "string") return actorId;

  await prisma.user.update({
    where: { id: userId },
    data: { locale: "fr" },
  });

  audit.log({
    actorId,
    action: "ADMIN_OVERRIDE",
    entity: "User",
    entityId: userId,
    payload: { action: "activate" },
  });

  return { success: true };
}

// ——— Service moderation ———

export async function publishService(serviceId: string): Promise<ActionResult> {
  const actorId = await requireAdmin();
  if (typeof actorId !== "string") return actorId;

  await prisma.service.update({
    where: { id: serviceId },
    data: { status: "PUBLISHED" },
  });

  audit.log({
    actorId,
    action: "ADMIN_OVERRIDE",
    entity: "Service",
    entityId: serviceId,
    payload: { action: "publish" },
  });

  return { success: true };
}

export async function archiveService(serviceId: string): Promise<ActionResult> {
  const actorId = await requireAdmin();
  if (typeof actorId !== "string") return actorId;

  await prisma.service.update({
    where: { id: serviceId },
    data: { status: "ARCHIVED" },
  });

  audit.log({
    actorId,
    action: "ADMIN_OVERRIDE",
    entity: "Service",
    entityId: serviceId,
    payload: { action: "archive" },
  });

  return { success: true };
}

// ——— Withdrawal processing ———

export async function approveWithdrawal(withdrawalId: string): Promise<ActionResult> {
  const actorId = await requireAdmin();
  if (typeof actorId !== "string") return actorId;

  const w = await prisma.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
  if (!w) return { error: "Demande introuvable." };
  if (w.status !== "REQUESTED") return { error: "Statut invalide." };

  await prisma.withdrawalRequest.update({
    where: { id: withdrawalId },
    data: { status: "APPROVED" },
  });

  audit.log({
    actorId,
    action: "WITHDRAWAL_APPROVED",
    entity: "WithdrawalRequest",
    entityId: withdrawalId,
    payload: { amount: Number(w.amountMinor), currency: w.currency },
  });

  return { success: true };
}

export async function rejectWithdrawal(withdrawalId: string): Promise<ActionResult> {
  const actorId = await requireAdmin();
  if (typeof actorId !== "string") return actorId;

  const w = await prisma.withdrawalRequest.findUnique({
    where: { id: withdrawalId },
    include: { wallet: true },
  });
  if (!w) return { error: "Demande introuvable." };
  if (w.status !== "REQUESTED" && w.status !== "APPROVED") return { error: "Statut invalide." };

  await prisma.$transaction([
    prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: { status: "REJECTED" },
    }),
    prisma.financialWallet.update({
      where: { id: w.walletId },
      data: { availableMinor: { increment: w.amountMinor } },
    }),
  ]);

  audit.log({
    actorId,
    action: "ADMIN_OVERRIDE",
    entity: "WithdrawalRequest",
    entityId: withdrawalId,
    payload: { action: "reject", amount: Number(w.amountMinor) },
  });

  return { success: true };
}

export async function markWithdrawalPaid(
  withdrawalId: string,
  payoutRef: string,
): Promise<ActionResult> {
  const actorId = await requireAdmin();
  if (typeof actorId !== "string") return actorId;

  const w = await prisma.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
  if (!w) return { error: "Demande introuvable." };
  if (w.status !== "APPROVED") return { error: "Le retrait doit être approuvé d'abord." };

  await prisma.withdrawalRequest.update({
    where: { id: withdrawalId },
    data: { status: "PAID", payoutRef },
  });

  audit.log({
    actorId,
    action: "WITHDRAWAL_APPROVED",
    entity: "WithdrawalRequest",
    entityId: withdrawalId,
    payload: { action: "paid", payoutRef },
  });

  return { success: true };
}
