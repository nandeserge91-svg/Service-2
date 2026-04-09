import nodemailer from "nodemailer";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Marketplace";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER ?? "",
      pass: process.env.SMTP_PASS ?? "",
    },
  });
}

const FROM = process.env.EMAIL_FROM ?? `${APP_NAME} <noreply@marketplace.com>`;

export { layout as baseLayout };

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
  .wrap{max-width:560px;margin:0 auto;padding:24px 16px}
  .card{background:#fff;border-radius:12px;padding:32px 24px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
  .logo{text-align:center;font-size:20px;font-weight:700;color:#4f46e5;margin-bottom:24px}
  h1{font-size:18px;color:#111827;margin:0 0 8px}
  p{font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 16px}
  .btn{display:inline-block;background:#4f46e5;color:#fff!important;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600}
  .footer{text-align:center;margin-top:24px;font-size:12px;color:#9ca3af}
  .muted{font-size:12px;color:#9ca3af}
</style></head>
<body><div class="wrap"><div class="card">
<div class="logo">${APP_NAME}</div>
${content}
</div>
<div class="footer">
  <p>${APP_NAME} — La marketplace de services pour l'Afrique</p>
</div>
</div></body></html>`;
}

interface SendMailOpts {
  to: string;
  subject: string;
  html: string;
}

export { send as sendMail };

async function send(opts: SendMailOpts): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[email:skip] SMTP non configuré — ${opts.subject} → ${opts.to}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return true;
  } catch (err) {
    console.error("[email:error]", err);
    return false;
  }
}

// ——— Email templates ———

export async function sendOrderCreatedBuyer(to: string, data: { orderId: string; serviceTitle: string; total: string }) {
  return send({
    to,
    subject: `Commande créée — ${data.serviceTitle}`,
    html: layout(`
      <h1>Votre commande a été créée</h1>
      <p>Vous avez passé une commande pour <strong>${data.serviceTitle}</strong>.</p>
      <p>Montant total : <strong>${data.total}</strong></p>
      <p>Finalisez le paiement pour que le vendeur puisse commencer à travailler.</p>
      <p style="text-align:center;margin:24px 0">
        <a class="btn" href="${APP_URL}/tableau-de-bord/client/commandes/${data.orderId}">Voir ma commande</a>
      </p>
      <p class="muted">Vos fonds seront protégés par notre système de séquestre jusqu'à la livraison.</p>
    `),
  });
}

export async function sendOrderCreatedSeller(to: string, data: { orderId: string; serviceTitle: string; buyerName: string }) {
  return send({
    to,
    subject: `Nouvelle commande — ${data.serviceTitle}`,
    html: layout(`
      <h1>Vous avez reçu une commande !</h1>
      <p><strong>${data.buyerName}</strong> a commandé votre service <strong>${data.serviceTitle}</strong>.</p>
      <p>Le paiement est en cours de traitement. Vous serez notifié dès la confirmation.</p>
      <p style="text-align:center;margin:24px 0">
        <a class="btn" href="${APP_URL}/tableau-de-bord/vendeur/commandes/${data.orderId}">Voir la commande</a>
      </p>
    `),
  });
}

export async function sendPaymentConfirmedBuyer(to: string, data: { orderId: string; serviceTitle: string }) {
  return send({
    to,
    subject: `Paiement confirmé — ${data.serviceTitle}`,
    html: layout(`
      <h1>Paiement confirmé</h1>
      <p>Votre paiement pour <strong>${data.serviceTitle}</strong> a été reçu avec succès.</p>
      <p>Le vendeur a été notifié et peut maintenant commencer à travailler.</p>
      <p style="text-align:center;margin:24px 0">
        <a class="btn" href="${APP_URL}/tableau-de-bord/client/commandes/${data.orderId}">Suivre ma commande</a>
      </p>
      <p class="muted">Vos fonds sont en séquestre et ne seront libérés qu'après votre validation.</p>
    `),
  });
}

export async function sendPaymentConfirmedSeller(to: string, data: { orderId: string; serviceTitle: string; buyerName: string }) {
  return send({
    to,
    subject: `Paiement reçu — commencez à travailler`,
    html: layout(`
      <h1>Le paiement a été confirmé</h1>
      <p><strong>${data.buyerName}</strong> a payé pour <strong>${data.serviceTitle}</strong>. Vous pouvez maintenant commencer.</p>
      <p style="text-align:center;margin:24px 0">
        <a class="btn" href="${APP_URL}/tableau-de-bord/vendeur/commandes/${data.orderId}">Commencer le travail</a>
      </p>
    `),
  });
}

export async function sendOrderDelivered(to: string, data: { orderId: string; serviceTitle: string; sellerName: string }) {
  return send({
    to,
    subject: `Livraison reçue — ${data.serviceTitle}`,
    html: layout(`
      <h1>Votre commande a été livrée</h1>
      <p><strong>${data.sellerName}</strong> a livré votre commande pour <strong>${data.serviceTitle}</strong>.</p>
      <p>Vérifiez le travail et acceptez la livraison ou demandez une révision.</p>
      <p style="text-align:center;margin:24px 0">
        <a class="btn" href="${APP_URL}/tableau-de-bord/client/commandes/${data.orderId}">Vérifier la livraison</a>
      </p>
    `),
  });
}

export async function sendOrderCompleted(to: string, data: { orderId: string; serviceTitle: string; netAmount: string }) {
  return send({
    to,
    subject: `Commande terminée — fonds libérés`,
    html: layout(`
      <h1>La commande est terminée !</h1>
      <p>Le client a accepté la livraison pour <strong>${data.serviceTitle}</strong>.</p>
      <p>Le montant de <strong>${data.netAmount}</strong> a été crédité sur votre portefeuille.</p>
      <p style="text-align:center;margin:24px 0">
        <a class="btn" href="${APP_URL}/tableau-de-bord/vendeur/revenus">Voir mes revenus</a>
      </p>
    `),
  });
}

export async function sendRevisionRequested(to: string, data: { orderId: string; serviceTitle: string; reason: string }) {
  return send({
    to,
    subject: `Révision demandée — ${data.serviceTitle}`,
    html: layout(`
      <h1>Le client demande une révision</h1>
      <p>Une révision a été demandée pour <strong>${data.serviceTitle}</strong>.</p>
      <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin:16px 0">
        <p style="margin:0;font-style:italic">"${data.reason}"</p>
      </div>
      <p style="text-align:center;margin:24px 0">
        <a class="btn" href="${APP_URL}/tableau-de-bord/vendeur/commandes/${data.orderId}">Traiter la révision</a>
      </p>
    `),
  });
}

export async function sendNewMessage(to: string, data: { conversationId: string; senderName: string; preview: string; role: "client" | "vendeur" }) {
  return send({
    to,
    subject: `Nouveau message de ${data.senderName}`,
    html: layout(`
      <h1>Vous avez un nouveau message</h1>
      <p><strong>${data.senderName}</strong> vous a envoyé un message :</p>
      <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin:16px 0">
        <p style="margin:0">${data.preview.slice(0, 200)}${data.preview.length > 200 ? "…" : ""}</p>
      </div>
      <p style="text-align:center;margin:24px 0">
        <a class="btn" href="${APP_URL}/tableau-de-bord/${data.role}/messages/${data.conversationId}">Répondre</a>
      </p>
    `),
  });
}

export async function sendOfferReceived(to: string, data: { conversationId: string; sellerName: string; offerTitle: string; amount: string }) {
  return send({
    to,
    subject: `Offre reçue de ${data.sellerName}`,
    html: layout(`
      <h1>Vous avez reçu une offre personnalisée</h1>
      <p><strong>${data.sellerName}</strong> vous propose : <strong>${data.offerTitle}</strong></p>
      <p>Montant : <strong>${data.amount}</strong></p>
      <p style="text-align:center;margin:24px 0">
        <a class="btn" href="${APP_URL}/tableau-de-bord/client/messages/${data.conversationId}">Voir l'offre</a>
      </p>
    `),
  });
}
