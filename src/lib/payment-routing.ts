import { prisma } from "./prisma";
import { createCheckoutSession, isChariowConfigured } from "./chariow";

export interface PaymentSessionInput {
  paymentId: string;
  orderId: string;
  buyerId: string;
  buyerEmail: string;
  buyerPhone?: string;
  amountMinor: bigint;
  currency: string;
  countryCode?: string;
  providerSlug?: string;
}

export interface PaymentSessionResult {
  provider: string;
  checkoutUrl: string;
  externalId?: string;
}

/**
 * Route payment to the best provider based on country, currency, and user choice.
 * Falls back to Chariow if no specific provider is selected.
 */
export async function createPaymentSession(
  input: PaymentSessionInput,
): Promise<PaymentSessionResult> {
  const slug = input.providerSlug ?? (await resolveProvider(input.currency, input.countryCode));

  if (slug === "orange_money") {
    return createOrangeMoneySession(input);
  }

  // Default: Chariow
  const result = await createCheckoutSession({
    paymentId: input.paymentId,
    orderId: input.orderId,
    buyerId: input.buyerId,
    buyerEmail: input.buyerEmail,
    amountMinor: input.amountMinor,
    currency: input.currency,
  });

  return {
    provider: "chariow",
    checkoutUrl: result.checkoutUrl,
    externalId: result.chariowSaleId,
  };
}

async function resolveProvider(currency: string, countryCode?: string): Promise<string> {
  if (countryCode) {
    const country = await prisma.countryConfig.findUnique({
      where: { countryCode },
    });
    if (country?.providers.length) return country.providers[0];
  }

  const provider = await prisma.paymentProvider.findFirst({
    where: {
      active: true,
      currencies: { has: currency },
    },
    orderBy: { sortOrder: "asc" },
  });

  return provider?.slug ?? "chariow";
}

/**
 * Orange Money payment session (stub — production requires Orange Money API credentials).
 * In dev, redirects to simulation page like Chariow.
 */
async function createOrangeMoneySession(
  input: PaymentSessionInput,
): Promise<PaymentSessionResult> {
  const apiKey = process.env.ORANGE_MONEY_API_KEY ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!apiKey) {
    return {
      provider: "orange_money",
      checkoutUrl: `${appUrl}/paiement/simulation?paymentId=${input.paymentId}&orderId=${input.orderId}&provider=orange_money`,
    };
  }

  const baseUrl = process.env.ORANGE_MONEY_API_URL ?? "https://api.orange.com/orange-money-webpay/v1";

  const res = await fetch(`${baseUrl}/webpayment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchant_key: process.env.ORANGE_MONEY_MERCHANT_KEY,
      currency: input.currency,
      order_id: input.orderId,
      amount: Number(input.amountMinor),
      return_url: `${appUrl}/paiement/succes?orderId=${input.orderId}`,
      cancel_url: `${appUrl}/paiement/annule?orderId=${input.orderId}`,
      notif_url: `${appUrl}/api/webhooks/orange-money`,
      lang: "fr",
      reference: input.paymentId,
    }),
  });

  const json = await res.json();

  return {
    provider: "orange_money",
    checkoutUrl: json.payment_url ?? `${appUrl}/paiement/simulation?paymentId=${input.paymentId}&orderId=${input.orderId}&provider=orange_money`,
    externalId: json.pay_token,
  };
}
