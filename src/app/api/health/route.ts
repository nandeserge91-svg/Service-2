import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function readAppVersion(): string {
  try {
    const raw = readFileSync(join(process.cwd(), "package.json"), "utf8");
    const pkg = JSON.parse(raw) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

/**
 * Santé de l’application pour load balancers, Kubernetes, UptimeRobot, etc.
 * GET → 200 si la base répond, 503 sinon.
 */
export async function GET() {
  const version = readAppVersion();
  let database = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch {
    database = false;
  }

  const ok = database;
  const body = {
    status: ok ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version,
    checks: { database },
  };

  return NextResponse.json(body, { status: ok ? 200 : 503 });
}
