const PROD_FALLBACK = "https://www.yugmach.com";
const DEV_FALLBACK = "http://localhost:3000";

/**
 * Single source of truth for the canonical site origin.
 *
 * Prefers NEXT_PUBLIC_SITE_URL when set. If it is missing we fall back to the
 * real production domain in production builds (so canonical/sitemap/JSON-LD can
 * never silently point at a throwaway Vercel preview URL) and to localhost in
 * dev. Trailing slash is stripped so callers can safely append paths.
 */
function resolveSiteBase(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  return process.env.NODE_ENV === "production" ? PROD_FALLBACK : DEV_FALLBACK;
}

export const SITE_URL = resolveSiteBase();

export function siteUrl(path = "/"): string {
  const base = SITE_URL;
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function absoluteUrl(path: string): string {
  return siteUrl(path);
}
