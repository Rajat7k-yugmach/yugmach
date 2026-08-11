"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { HomeMachineFinder } from "@/components/HomeMachineFinder";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import type { ProductListItem } from "@/lib/api/catalogue";

const API = "";

type FinderStepDto = {
  key: string;
  label: string;
  helpText?: string;
  inputType: "select" | "chip" | "number";
  options: { id: string; label: string }[];
  source: string;
  dependsOn: string | null;
  visibleWhen: {
    map?: Record<string, { id: string; label: string }[]>;
    depends_on_key?: string;
  };
  sortOrder: number;
};

/** Related applications so spice/powder buyers still get a full shortlist. */
const RELATED_APPS: Record<string, string[]> = {
  "garam-masala": ["masala", "powder", "haldi-powder", "dhaniya-powder", "meat-masala"],
  masala: ["garam-masala", "powder", "haldi-powder", "dhaniya-powder", "meat-masala"],
  "meat-masala": ["masala", "garam-masala", "powder"],
  "haldi-powder": ["powder", "masala", "dhaniya-powder", "garam-masala"],
  "dhaniya-powder": ["powder", "masala", "haldi-powder"],
  powder: ["masala", "haldi-powder", "dhaniya-powder", "coffee", "sooji-rawa"],
  namkeen: ["snacks", "kurkure", "banana-chips"],
  snacks: ["namkeen", "kurkure", "banana-chips"],
  kurkure: ["snacks", "namkeen", "banana-chips"],
  "banana-chips": ["snacks", "namkeen"],
  coffee: ["powder", "tea"],
  tea: ["powder", "coffee"],
  "detergent-powder": ["detergent-cake", "powder"],
  "detergent-cake": ["detergent-powder"],
};

function capacityPph(p: ProductListItem): number {
  const raw =
    p.specs?.capacity_pph ??
    p.specs?.capacityPph ??
    p.specs?.capacity ??
    null;
  if (raw == null) return 0;
  const n = Number(String(raw).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function capacityTarget(band: string): { idealMin: number; idealMax: number } | null {
  switch (band) {
    case "under-500":
      return { idealMin: 0, idealMax: 500 };
    case "500-1500":
      return { idealMin: 500, idealMax: 1500 };
    case "1500-3000":
      return { idealMin: 1500, idealMax: 3000 };
    case "3000-plus":
    case "3000":
      return { idealMin: 2500, idealMax: 10000 };
    default:
      return null;
  }
}

function budgetRangePaise(band: string): { min: number; max: number } | null {
  switch (band) {
    case "1-2L":
    case "under-2L":
      return { min: 0, max: 2_00_000 * 100 };
    case "2-4L":
      return { min: 1_50_000 * 100, max: 4_50_000 * 100 };
    case "4-7L":
      return { min: 3_50_000 * 100, max: 7_50_000 * 100 };
    case "4L-plus":
    case "7L-plus":
      return { min: 3_50_000 * 100, max: Number.MAX_SAFE_INTEGER };
    default:
      return null;
  }
}

function productAppSlugs(p: ProductListItem): string[] {
  return (p.applications || [])
    .map((ref) => (typeof ref === "string" ? ref : ref?.slug || ""))
    .filter(Boolean);
}

function scoreProduct(
  p: ProductListItem,
  opts: {
    application: string;
    related: Set<string>;
    capacity: string;
    budget: string;
  },
): number {
  let score = 0;
  const apps = productAppSlugs(p);
  if (opts.application && opts.application !== "other") {
    if (apps.includes(opts.application)) score += 100;
    else if (apps.some((a) => opts.related.has(a))) score += 55;
    else if (
      p.name.toLowerCase().includes(opts.application.replace(/-/g, " ")) ||
      p.slug.includes(opts.application)
    ) {
      score += 40;
    } else {
      score += 5;
    }
  } else {
    score += 20;
  }

  const cap = capacityPph(p);
  const target = capacityTarget(opts.capacity);
  if (target && opts.capacity && opts.capacity !== "other") {
    if (cap > 0) {
      if (cap >= target.idealMin && cap <= target.idealMax) score += 45;
      else if (cap >= target.idealMin * 0.7 && cap <= target.idealMax * 1.25)
        score += 30;
      else if (opts.capacity === "3000-plus" || opts.capacity === "3000") {
        // High-speed ask: prefer highest available lines even below 3000
        score += Math.min(35, Math.round(cap / 100));
      } else {
        const mid = (target.idealMin + target.idealMax) / 2;
        const dist = Math.abs(cap - mid) / Math.max(mid, 1);
        score += Math.max(5, 28 - Math.round(dist * 20));
      }
    } else {
      score += 12;
    }
  }

  const band = budgetRangePaise(opts.budget);
  if (band && opts.budget && opts.budget !== "other") {
    const price = p.pricePaise ?? 0;
    if (!price) score += 10;
    else if (price >= band.min && price <= band.max) score += 35;
    else if (price >= band.min * 0.75 && price <= band.max * 1.35) score += 22;
    else score += 8;
  } else if (p.pricePaise) {
    score += 5;
  }

  if (p.isFeatured) score += 8;
  if (p.primaryImage) score += 4;

  return score;
}

function dedupeBySlug(list: ProductListItem[]): ProductListItem[] {
  const seen = new Set<string>();
  const out: ProductListItem[] = [];
  for (const p of list) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    out.push(p);
  }
  return out;
}

async function fetchProducts(qs: string): Promise<ProductListItem[]> {
  const res = await fetch(`${API}/api/v1/products/?${qs}`);
  const data = await res.json();
  return (data.results || data || []) as ProductListItem[];
}

function FinderInner() {
  const params = useSearchParams();
  const application = params.get("application") || params.get("product") || "";
  const applicationOther = params.get("application_other") || "";
  const capacity = params.get("capacity") || params.get("pph") || "";
  const capacityOther = params.get("capacity_other") || "";
  const budget = params.get("budget") || "";
  const budgetOther = params.get("budget_other") || "";
  const hasAnswers = Boolean(application);

  const [apps, setApps] = useState<{ slug: string; name: string }[]>([]);
  const [steps, setSteps] = useState<FinderStepDto[]>([]);
  const [results, setResults] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/v1/applications/`).then((r) => r.json()),
      fetch(`${API}/api/v1/finder-steps/`)
        .then((r) => r.json())
        .catch(() => ({ results: [] })),
    ]).then(([appData, stepData]) => {
      const appList = (appData.results || appData || []).map(
        (a: { slug: string; name: string }) => ({ slug: a.slug, name: a.name }),
      );
      setApps(appList);
      setSteps((stepData.results || stepData || []) as FinderStepDto[]);
    });
  }, []);

  useEffect(() => {
    if (!hasAnswers) return;
    let cancelled = false;
    setLoading(true);

    const related = RELATED_APPS[application] || [];
    const relatedSet = new Set(related);

    (async () => {
      const pools: ProductListItem[] = [];

      if (application && application !== "other") {
        pools.push(
          ...(await fetchProducts(
            new URLSearchParams({ application, page_size: "40" }).toString(),
          )),
        );
        for (const rel of related.slice(0, 3)) {
          pools.push(
            ...(await fetchProducts(
              new URLSearchParams({ application: rel, page_size: "20" }).toString(),
            )),
          );
        }
      }

      // Always blend in a broader catalogue slice so high-capacity / budget asks fill out
      pools.push(
        ...(await fetchProducts(
          new URLSearchParams({ page_size: "40", ordering: "-is_featured" }).toString(),
        ).catch(() => fetchProducts("page_size=40"))),
      );

      if (cancelled) return;

      const merged = dedupeBySlug(pools);
      const ranked = merged
        .map((p) => ({
          p,
          score: scoreProduct(p, {
            application,
            related: relatedSet,
            capacity,
            budget,
          }),
        }))
        .sort((a, b) => b.score - a.score || (b.p.pricePaise ?? 0) - (a.p.pricePaise ?? 0))
        .map((x) => x.p)
        .slice(0, 8);

      setResults(ranked);
    })()
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hasAnswers, application, capacity, budget]);

  const summary = useMemo(() => {
    const chips: string[] = [];
    if (application === "other" && applicationOther) {
      chips.push(applicationOther);
    } else if (application) {
      const named = apps.find((a) => a.slug === application)?.name;
      chips.push(named || application);
    }
    if (capacity === "other" && capacityOther) {
      chips.push(capacityOther);
    } else if (capacity && capacity !== "other") {
      chips.push(capacity);
    }
    if (budget === "other" && budgetOther) {
      chips.push(budgetOther);
    } else if (budget && budget !== "other") {
      chips.push(budget);
    }
    return chips;
  }, [
    application,
    applicationOther,
    capacity,
    capacityOther,
    budget,
    budgetOther,
    apps,
  ]);

  const waFinderMessage = useMemo(() => {
    const product =
      application === "other" && applicationOther
        ? applicationOther
        : application;
    const speed =
      capacity === "other" && capacityOther ? capacityOther : capacity || "—";
    const money =
      budget === "other" && budgetOther ? budgetOther : budget || "—";
    return `Hi, I used the machine finder. Product: ${product}, capacity: ${speed}, budget: ${money}. Please help with matching machines.`;
  }, [
    application,
    applicationOther,
    capacity,
    capacityOther,
    budget,
    budgetOther,
  ]);

  if (!hasAnswers) {
    return (
      <main className="mx-auto max-w-xl px-4 py-10 pb-24">
        <h1 className="font-display text-3xl font-semibold">Find My Machine</h1>
        <p className="mt-2 text-ink-muted">
          Answer a few questions — we match machines to what you pack.
        </p>
        <div className="mt-8">
          <HomeMachineFinder applications={apps} steps={steps} />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 pb-24">
      <h1 className="font-display text-3xl font-semibold">Matching machines</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {summary.map((s) => (
          <span
            key={s}
            className="rounded-full border border-border bg-surface-sunken px-3 py-1 text-xs font-medium"
          >
            {s}
          </span>
        ))}
        <Link
          href="/machine-finder"
          className="text-xs font-semibold text-trust underline"
        >
          Change answers
        </Link>
      </div>

      {loading ? (
        <p className="mt-8 text-ink-muted">Finding machines…</p>
      ) : results.length === 0 ? (
        <div className="card-elevated mt-8 p-6">
          <p className="font-semibold">Tell us on WhatsApp what you pack</p>
          <p className="mt-2 text-sm text-ink-muted">
            We&apos;ll configure a line for your product, pouch size, and speed.
          </p>
          <WhatsAppButton
            message={waFinderMessage}
            placement="finder"
            className="tap-target mt-4 inline-flex rounded-md bg-whatsapp px-5 py-3 font-semibold text-white"
          >
            Get Price on WhatsApp
          </WhatsAppButton>
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm text-ink-muted">
            <span className="font-semibold text-amber-text">Best match</span>{" "}
            flagged first.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
            {results.map((p, i) => (
              <li key={p.slug} className="relative h-full">
                {i === 0 ? (
                  <span className="absolute left-2 top-2 z-10 rounded-xs bg-amber px-2 py-0.5 text-[10px] font-semibold text-amber-ink">
                    Best match
                  </span>
                ) : null}
                <ProductCard product={p} showPouch={false} />
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <WhatsAppButton
              message={waFinderMessage}
              placement="finder"
              className="tap-target inline-flex rounded-md bg-whatsapp px-5 py-3 font-semibold text-white"
            >
              Get Price on WhatsApp
            </WhatsAppButton>
          </div>
        </>
      )}
    </main>
  );
}

export default function MachineFinderPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-xl px-4 py-10">Loading…</main>
      }
    >
      <FinderInner />
    </Suspense>
  );
}
