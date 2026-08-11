export type LeadPayload = {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  city?: string;
  state?: string;
  message?: string;
  productToPack?: string;
  requiredPph?: number;
  pouchSizeRange?: string;
  budgetBand?: string;
  timeline?: string;
  needsFinance?: boolean;
  needsSubsidyHelp?: boolean;
  productSlug?: string;
  source?: string;
  pageUrl?: string;
  website?: string;
  company_url?: string;
};

export async function submitLead(
  payload: LeadPayload,
): Promise<{ ok: true; id?: string } | { ok: false; error: string; details?: unknown }> {
  try {
    const res = await fetch("/api/v1/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let details: unknown;
      try {
        details = await res.json();
      } catch {
        details = undefined;
      }
      return { ok: false, error: `Lead submit failed (${res.status})`, details };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}
