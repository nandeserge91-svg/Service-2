"use server";

import { headers } from "next/headers";
import { deferAfterResponse } from "./deferred";
import { baseLayout } from "./email";
import { enqueueEmailOutbox, processEmailOutboxBatch } from "./outbox-email";
import { getClientIpFromHeaders } from "./client-ip";
import { rateLimit } from "./rate-limit-memory";

interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function submitContactForm(formData: FormData): Promise<ActionResult> {
  const h = await headers();
  const ip = getClientIpFromHeaders(h);
  if (!rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Trop de messages envoyés. Réessayez dans une heure." };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const subject = (formData.get("subject") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !subject || !message) {
    return { error: "Veuillez remplir tous les champs." };
  }

  if (message.length < 10) {
    return { error: "Votre message est trop court (10 caractères minimum)." };
  }

  if (message.length > 5000) {
    return { error: "Votre message est trop long (5000 caractères maximum)." };
  }

  const adminEmail = process.env.CONTACT_EMAIL ?? process.env.EMAIL_FROM;

  if (adminEmail) {
    const html = baseLayout(`
      <h2 style="margin:0 0 16px">Nouveau message de contact</h2>
      <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
      <p><strong>E-mail :</strong> ${escapeHtml(email)}</p>
      <p><strong>Sujet :</strong> ${escapeHtml(subject)}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
      <p style="white-space:pre-line">${escapeHtml(message)}</p>
    `);

    await enqueueEmailOutbox("contact", {
      to: adminEmail,
      subject: `[Contact] ${subject} — ${name}`,
      html,
    });
    deferAfterResponse(() => void processEmailOutboxBatch(25));
  }

  return { success: true };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
