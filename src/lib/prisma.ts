import { PrismaClient, type Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/** True when a non-empty DATABASE_URL is set (Prisma / pg adapter). */
export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/**
 * During `next build`, Postgres is often unavailable; Prisma still logs query
 * failures even inside try/catch. Silence client logs in that phase unless
 * PRISMA_LOG overrides (`none`, `off`, or comma-separated levels).
 *
 * Uses NEXT_PHASE (set by Next.js) — works with `npx next build`, not only `npm run build`.
 */
function resolvePrismaLog(): Prisma.LogLevel[] {
  const override = process.env.PRISMA_LOG?.trim();
  if (override === "none" || override === "off") return [];
  if (override) {
    return override.split(",").map((s) => s.trim()) as Prisma.LogLevel[];
  }
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build"
  ) {
    return [];
  }
  if (process.env.NODE_ENV === "development") return ["query", "error", "warn"];
  return ["error"];
}

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({
    adapter,
    log: resolvePrismaLog(),
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
