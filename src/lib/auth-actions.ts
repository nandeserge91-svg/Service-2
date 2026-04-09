"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { getClientIpFromHeaders } from "./client-ip";
import { rateLimit } from "./rate-limit-memory";

interface ActionResult {
  success?: boolean;
  error?: string;
}

async function limitRegistrations(): Promise<ActionResult | null> {
  const h = await headers();
  const ip = getClientIpFromHeaders(h);
  if (!rateLimit(`register:${ip}`, 10, 60 * 60 * 1000)) {
    return { error: "Trop de tentatives d'inscription. Réessayez dans une heure." };
  }
  return null;
}

export async function registerClient(formData: FormData): Promise<ActionResult> {
  const limited = await limitRegistrations();
  if (limited) return limited;

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Tous les champs sont obligatoires." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Cette adresse email est déjà utilisée." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      buyerProfile: { create: { displayName: name } },
      roleAssignments: { create: { role: "CLIENT" } },
    },
  });

  return { success: true };
}

export async function registerSeller(formData: FormData): Promise<ActionResult> {
  const limited = await limitRegistrations();
  if (limited) return limited;

  const displayName = (formData.get("displayName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const countryCode = (formData.get("countryCode") as string)?.trim();

  if (!displayName || !email || !password || !countryCode) {
    return { error: "Tous les champs sont obligatoires." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Cette adresse email est déjà utilisée." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      sellerProfile: {
        create: { displayName, countryCode: countryCode.toUpperCase() },
      },
      roleAssignments: {
        createMany: { data: [{ role: "SELLER" }, { role: "CLIENT" }] },
      },
    },
  });

  return { success: true };
}
