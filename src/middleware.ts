import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STATIC_REDIRECTS: Record<string, string> = {
  "/price-list": "/products",
  "/catalogue": "/products",
  "/machines/auger-filler": "/machines",
  "/sitemap": "/site-map",
};

type RedirectRule = { source: string; destination: string; isPermanent: boolean };

let cachedRules: RedirectRule[] | null = null;
let cachedAt = 0;
const CACHE_MS = 5 * 60 * 1000;

async function loadRedirects(): Promise<RedirectRule[]> {
  const now = Date.now();
  if (cachedRules && now - cachedAt < CACHE_MS) return cachedRules;

  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!connectionString) {
    cachedRules = cachedRules ?? [];
    return cachedRules;
  }

  try {
    const sql = neon(connectionString);
    // Payload/Drizzle table name for redirects collection
    const rows = (await sql`
      SELECT source, destination, is_permanent AS "isPermanent"
      FROM redirects
      WHERE source IS NOT NULL AND destination IS NOT NULL
    `) as Array<{ source: string; destination: string; isPermanent: boolean }>;

    cachedRules = rows.filter(
      (r) =>
        r.source &&
        r.destination &&
        r.source !== r.destination &&
        !r.source.includes("#"),
    );
    cachedAt = now;
  } catch {
    // Fallback: empty / previous cache — site still works without DB redirects
    cachedRules = cachedRules ?? [];
  }
  return cachedRules;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Payload admin: skip redirects and mark route so root layout does not wrap admin
  if (pathname.startsWith("/admin")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-payload-admin", "1");
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const staticDest = STATIC_REDIRECTS[pathname];
  if (staticDest) {
    const url = request.nextUrl.clone();
    url.pathname = staticDest;
    return NextResponse.redirect(url, 308);
  }

  const rules = await loadRedirects();
  const match = rules.find((r) => r.source === pathname);
  if (match) {
    const url = request.nextUrl.clone();
    try {
      if (match.destination.startsWith("http")) {
        return NextResponse.redirect(match.destination, match.isPermanent ? 308 : 307);
      }
      url.pathname = match.destination;
      return NextResponse.redirect(url, match.isPermanent ? 308 : 307);
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
