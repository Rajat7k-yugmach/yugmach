"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { WhatsAppButton } from "@/components/WhatsAppButton";
import { apiUrl } from "@/lib/api/client";
import { trackEvent } from "@/lib/analytics";

type Rec = {
  slug: string;
  name: string;
  priceDisplay?: string | null;
  shortDescription?: string;
};

export default function AdvisorPage() {
  const [productToPack, setProductToPack] = useState("namkeen");
  const [requiredPph, setRequiredPph] = useState("1800");
  const [budgetMaxInr, setBudgetMaxInr] = useState("500000");
  const [loading, setLoading] = useState(false);
  const [rationale, setRationale] = useState("");
  const [recs, setRecs] = useState<Rec[]>([]);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/api/v1/advisor/recommend/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productToPack,
          requiredPph: requiredPph ? Number(requiredPph) : null,
          budgetMaxInr: budgetMaxInr ? Number(budgetMaxInr) : null,
        }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = (await res.json()) as {
        recommendations: Rec[];
        rationale: string;
      };
      setRecs(data.recommendations ?? []);
      setRationale(data.rationale ?? "");
      trackEvent("advisor_recommend", {
        count: data.recommendations?.length ?? 0,
      });
    } catch {
      setError("Advisor unavailable — try Machine Finder instead.");
      setRecs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 pb-24 md:py-10">
      <p className="section-label text-amber-text">Machines</p>
      <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
        Machine advisor
      </h1>
      <p className="mt-3 text-ink-muted">
        Tell us what you pack, target speed, and budget — get a shortlist from
        published catalogue prices (GST extra). Not a substitute for a product
        trial.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold sm:col-span-2">
            Product to pack
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base font-normal text-ink"
              value={productToPack}
              onChange={(e) => setProductToPack(e.target.value)}
              placeholder="Namkeen, masala, powder…"
              required
            />
          </label>
          <label className="block text-sm font-semibold">
            Target packs / hour
            <input
              type="number"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base font-normal text-ink"
              value={requiredPph}
              onChange={(e) => setRequiredPph(e.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold">
            Max budget (₹)
            <input
              type="number"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base font-normal text-ink"
              value={budgetMaxInr}
              onChange={(e) => setBudgetMaxInr(e.target.value)}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="tap-target mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3.5 text-base font-bold text-white disabled:opacity-50"
        >
          {loading ? "Matching…" : "Recommend machines"}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </form>

      {error ? (
        <p className="mt-6 text-sm text-red-700">
          {error}{" "}
          <Link href="/machine-finder" className="underline">
            Open Machine Finder
          </Link>
        </p>
      ) : null}

      {rationale ? (
        <p className="mt-6 text-sm leading-relaxed text-ink-muted">{rationale}</p>
      ) : null}

      {recs.length ? (
        <ul className="mt-6 space-y-3">
          {recs.map((r) => (
            <li
              key={r.slug}
              className="flex flex-wrap items-baseline justify-between gap-3 rounded-xl border border-border bg-white px-4 py-4 shadow-sm"
            >
              <div>
                <Link
                  href={`/products/${r.slug}`}
                  className="font-display text-base font-extrabold text-ink hover:underline"
                >
                  {r.name}
                </Link>
                {r.shortDescription ? (
                  <p className="mt-1 text-sm text-ink-muted">
                    {r.shortDescription}
                  </p>
                ) : null}
              </div>
              <span className="tabular-price font-semibold text-price">
                {r.priceDisplay ?? "—"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        <WhatsAppButton
          message="Hi, I used the machine advisor and want help choosing"
          className="tap-target inline-flex items-center justify-center rounded-lg bg-whatsapp px-5 py-3 text-sm font-bold text-white"
        >
          WhatsApp results
        </WhatsAppButton>
        <Link
          href="/machine-finder"
          className="tap-target inline-flex items-center justify-center rounded-lg border border-border bg-white px-5 py-3 text-sm font-semibold text-ink"
        >
          Machine finder
        </Link>
        <Link
          href="/compare"
          className="tap-target inline-flex items-center justify-center rounded-lg border border-border bg-white px-5 py-3 text-sm font-semibold text-ink"
        >
          Compare
        </Link>
      </div>
    </main>
  );
}
