import { NextRequest, NextResponse } from "next/server";
import { processReminders } from "@/lib/reminders";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

export async function GET(request: NextRequest) {
  const secret =
    request.nextUrl.searchParams.get("secret") ??
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await processReminders();

  return NextResponse.json({
    ok: true,
    ...result,
    processedAt: new Date().toISOString(),
  });
}
