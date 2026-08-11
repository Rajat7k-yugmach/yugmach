export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

/** Same-origin base for browser API calls (leads, advisor, PDFs). */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") return normalized;
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  return `${site}${normalized}`;
}

export function formatInrFromPaise(paise: number | null | undefined): string | null {
  if (paise == null) return null;
  const rupees = Math.floor(paise / 100);
  const s = String(Math.abs(rupees));
  if (s.length <= 3) return `₹${s}`;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const parts: string[] = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) parts.unshift(rest);
  return `₹${parts.join(",")},${last3}`;
}

export function subsidyEffectivePaise(pricePaise: number): {
  subsidyPaise: number;
  effectivePaise: number;
} {
  const cap = 10_00_000 * 100;
  const raw = Math.floor(pricePaise * 0.35);
  const subsidyPaise = Math.min(raw, cap);
  return { subsidyPaise, effectivePaise: pricePaise - subsidyPaise };
}

export function calcEmi(principal: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

export const WHATSAPP_NUMBER = "917500399754";

export function waLink(text: string, e164?: string): string {
  const num = (e164 || WHATSAPP_NUMBER).replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

/** @deprecated Prefer Payload Local API helpers in catalogue.ts */
export async function apiGet<T>(_path: string, _tags: string[] = []): Promise<T> {
  throw new Error("apiGet is retired — use Payload helpers in @/lib/api/catalogue");
}

/** @deprecated Prefer Payload Local API helpers in catalogue.ts */
export async function apiGetOptional<T>(
  _path: string,
  _tags: string[] = [],
): Promise<T | null> {
  throw new Error("apiGetOptional is retired — use Payload helpers in @/lib/api/catalogue");
}

export const apiFetch = apiGet;
export const apiFetchOptional = apiGetOptional;
