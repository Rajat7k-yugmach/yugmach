/**
 * Payload `serverURL` must match the host the browser uses for `/admin`.
 * Prefer deployment host over NEXT_PUBLIC_SITE_URL — that env is often set to
 * www.yugmach.com before DNS is live, which breaks cookies and Blob client uploads.
 */
function isUsableHttpUrl(value: string | undefined | null): value is string {
  if (!value) return false;
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed || trimmed.includes("[SENSITIVE]") || trimmed === "undefined") {
    return false;
  }
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function resolvePayloadServerURL(): string | undefined {
  const explicit = process.env.PAYLOAD_SERVER_URL?.replace(/\/$/, "");
  if (isUsableHttpUrl(explicit)) return explicit;

  // On preview deployments, VERCEL_URL is this deployment — do NOT prefer
  // VERCEL_PROJECT_PRODUCTION_URL or cookies/CSRF break across hosts.
  const vercelEnv = process.env.VERCEL_ENV; // production | preview | development
  if (vercelEnv === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (isUsableHttpUrl(site)) return site;

  // Local / unknown — let Payload use localhost when possible
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  return undefined;
}

/** Origins allowed for Payload CSRF (admin may be on vercel.app while SITE_URL differs). */
export function resolvePayloadCsrfOrigins(): string[] {
  const origins = new Set<string>();

  const push = (value?: string) => {
    if (!isUsableHttpUrl(value)) return;
    try {
      origins.add(new URL(value).origin);
    } catch {
      // ignore invalid
    }
  };

  push(process.env.PAYLOAD_SERVER_URL);
  push(process.env.NEXT_PUBLIC_SITE_URL);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  if (process.env.VERCEL_URL) {
    push(`https://${process.env.VERCEL_URL}`);
  }
  // Stable production alias used in ADMIN-HOWTO
  push("https://frontend-six-kappa-clmd7dlhna.vercel.app");
  push("http://localhost:3000");
  push("http://127.0.0.1:3000");
  push("http://localhost:3101");

  return [...origins];
}
