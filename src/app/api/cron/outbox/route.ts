import { NextRequest, NextResponse } from "next/server";
import { processEmailOutboxBatch } from "@/lib/outbox-email";

export const dynamic = "force-dynamic";

/**
 * Dépile la file d’e-mails PostgreSQL (Phase 4.64).
 * Protéger par secret (header Authorization Bearer ou query `secret`).
 * Ex. cron : `GET /api/cron/outbox` avec `CRON_SECRET` en prod.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  const q = request.nextUrl.searchParams.get("secret");
  const ok =
    auth === `Bearer ${secret}` || q === secret;
  if (!ok) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 50));
  const result = await processEmailOutboxBatch(limit);
  return NextResponse.json({ ok: true, ...result });
}
