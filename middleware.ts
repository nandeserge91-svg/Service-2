import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { rateLimit } from "@/lib/rate-limit-memory";

const { auth } = NextAuth(authConfig);

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export default auth((req) => {
  if (
    req.method === "POST" &&
    req.nextUrl.pathname.startsWith("/api/auth/") &&
    req.nextUrl.pathname.includes("credentials")
  ) {
    const ip = clientIp(req);
    if (!rateLimit(`auth:credentials:${ip}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Trop de tentatives de connexion. Réessayez dans quelques minutes." },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": "900",
          },
        },
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  // Ne pas élargir ce matcher sans exclure `/monitoring` (tunnel Sentry — Phase 4.62).
  matcher: ["/tableau-de-bord/:path*", "/api/auth/:path*"],
};
