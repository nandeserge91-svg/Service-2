/**
 * Chariow payment acquirer client.
 *
 * When CHARIOW_API_KEY is empty (dev), falls back to a local simulation
 * flow via /paiement/simulation?paymentId=xxx.
 *
 * In production, calls Chariow Checkout API → redirects buyer to
 * checkout_url → Pulse webhook confirms payment.
 */

const API_URL = process.env.CHARIOW_API_URL ?? "https://api.chariow.com/v1";
const API_KEY = process.env.CHARIOW_API_KEY ?? "";
const PRODUCT_ID = process.env.CHARIOW_PRODUCT_ID ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function isChariowConfigured(): boolean {
  return !!(API_KEY && PRODUCT_ID);
}

interface CheckoutResult {
  checkoutUrl: string;
  chariowSaleId?: string;
}

async function chariowFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      `Chariow API ${res.status}: ${json.message ?? JSON.stringify(json.errors ?? {})}`,
    );
  }

  return json;
}

/**
 * Create a checkout session for an order payment.
 * Returns the URL to redirect the buyer to.
 */
export async function createCheckoutSession(opts: {
  paymentId: string;
  orderId: string;
  buyerId: string;
  buyerEmail: string;
  amountMinor: bigint;
  currency: string;
}): Promise<CheckoutResult> {
  if (!isChariowConfigured()) {
    return {
      checkoutUrl: `${APP_URL}/paiement/simulation?paymentId=${opts.paymentId}&orderId=${opts.orderId}`,
    };
  }

  const json = await chariowFetch("/checkout", {
    method: "POST",
    body: JSON.stringify({
      product_id: PRODUCT_ID,
      buyer_email: opts.buyerEmail,
      payment_currency: opts.currency,
      custom_metadata: {
        internal_order_id: opts.orderId,
        internal_payment_id: opts.paymentId,
        buyer_id: opts.buyerId,
        amount_minor: opts.amountMinor.toString(),
      },
      success_url: `${APP_URL}/paiement/succes?orderId=${opts.orderId}`,
      cancel_url: `${APP_URL}/paiement/annule?orderId=${opts.orderId}`,
    }),
  });

  return {
    checkoutUrl: json.data?.checkout_url,
    chariowSaleId: json.data?.sale_id,
  };
}

/**
 * Verify a sale status via Chariow Sales API.
 */
export async function getSaleStatus(saleId: string) {
  const json = await chariowFetch(`/sales/${saleId}`);
  return {
    saleStatus: json.data?.status as string,
    paymentStatus: json.data?.payment_status as string,
  };
}

/**
 * Validate a Pulse webhook payload.
 * Chariow doc doesn't specify signature verification — check raw body
 * against a shared secret if available.
 */
export function validateWebhookPayload(
  body: string,
  signature: string | null,
): boolean {
  const secret = process.env.CHARIOW_WEBHOOK_SECRET;
  if (!secret) return true; // no secret configured = skip validation (dev)

  if (!signature) return false;

  // HMAC-SHA256 verification if Chariow provides it
  try {
    const crypto = require("crypto");
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}
