"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";

import { WhatsAppButton } from "@/components/WhatsAppButton";
import { toPublicImageSrc } from "@/lib/media";
import { cn } from "@/lib/utils";

export type CompareProduct = {
  slug: string;
  name: string;
  priceDisplay: string | null;
  shortDescription?: string;
  specs?: Record<string, unknown>;
  primaryImage?: { url: string; alt?: string } | null;
};

type Curated = { label: string; ids: string };

type Props = {
  products: CompareProduct[];
  initialIds: string[];
  curated: Curated[];
};

const MAX = 4;

function specLabel(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CompareMachines({ products, initialIds, curated }: Props) {
  const router = useRouter();
  const bySlug = useMemo(
    () => new Map(products.map((p) => [p.slug, p])),
    [products],
  );
  const [selected, setSelected] = useState<string[]>(() =>
    initialIds.filter((id) => bySlug.has(id)).slice(0, MAX),
  );
  const [query, setQuery] = useState("");

  // Keep selection in sync when curated links / ?ids= navigation change
  const initialKey = initialIds.join(",");
  useEffect(() => {
    setSelected(
      initialKey
        ? initialKey.split(",").filter((id) => bySlug.has(id)).slice(0, MAX)
        : [],
    );
  }, [initialKey, bySlug]);

  const selectedProducts = selected
    .map((s) => bySlug.get(s))
    .filter((p): p is CompareProduct => Boolean(p));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 24);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.shortDescription || "").toLowerCase().includes(q),
      )
      .slice(0, 24);
  }, [products, query]);

  function toggle(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX) return prev;
      return [...prev, slug];
    });
  }

  function applyCompare() {
    if (selected.length < 2) return;
    router.push(`/compare?ids=${selected.join(",")}`);
  }

  const keys = Array.from(
    new Set(selectedProducts.flatMap((p) => Object.keys(p.specs || {}))),
  ).slice(0, 18);

  return (
    <div className="space-y-10">
      {/* Persona intro + curated */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
        <p className="text-sm leading-relaxed text-ink-muted">
          Pick 2–4 machines side by side — price, speed, and key specs — so you
          know what fits your line before WhatsApping us.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {curated.map((c) => (
            <Link
              key={c.ids}
              href={`/compare?ids=${c.ids}`}
              className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink transition hover:border-amber hover:text-amber-text"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Selection */}
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink">
              Choose machines
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {selected.length}/{MAX} selected — need at least 2 to compare
            </p>
          </div>
          <button
            type="button"
            disabled={selected.length < 2}
            onClick={applyCompare}
            className="tap-target inline-flex items-center gap-1.5 rounded-lg bg-amber px-4 py-2.5 text-sm font-bold text-white disabled:opacity-45"
          >
            Compare selected
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>

        {selectedProducts.length ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {selectedProducts.map((p) => (
              <li
                key={p.slug}
                className="inline-flex items-center gap-2 rounded-full border border-amber/40 bg-amber/10 px-3 py-1.5 text-sm font-semibold text-ink"
              >
                {p.name}
                <button
                  type="button"
                  aria-label={`Remove ${p.name}`}
                  onClick={() => toggle(p.slug)}
                  className="rounded-full p-0.5 hover:bg-amber/20"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <label className="mt-5 block">
          <span className="sr-only">Search machines</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name — namkeen, spice, powder…"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-ink shadow-sm outline-none ring-amber/30 placeholder:text-ink-muted focus:ring-2"
          />
        </label>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const on = selected.includes(p.slug);
            const full = !on && selected.length >= MAX;
            return (
              <li key={p.slug}>
                <button
                  type="button"
                  disabled={full}
                  onClick={() => toggle(p.slug)}
                  className={cn(
                    "flex w-full gap-3 rounded-xl border bg-white p-3 text-left transition",
                    on
                      ? "border-amber ring-2 ring-amber/25"
                      : "border-border hover:border-amber/50",
                    full && "opacity-50",
                  )}
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                    {(() => {
                      const src = toPublicImageSrc(p.primaryImage?.url);
                      return src ? (
                        <Image
                          src={src}
                          alt={p.name}
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                          unoptimized={src.startsWith("/")}
                        />
                      ) : null;
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{p.name}</p>
                    <p className="mt-0.5 text-sm font-semibold text-price">
                      {p.priceDisplay || "Ask price"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full border",
                      on
                        ? "border-amber bg-amber text-white"
                        : "border-border text-transparent",
                    )}
                  >
                    <Check className="size-3.5" aria-hidden />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Table */}
      {selectedProducts.length >= 2 ? (
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Side-by-side
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="sticky left-0 bg-surface px-4 py-3 font-bold text-ink">
                    Spec
                  </th>
                  {selectedProducts.map((p) => (
                    <th key={p.slug} className="min-w-[160px] px-4 py-3">
                      <Link
                        href={`/products/${p.slug}`}
                        className="font-bold text-ink hover:underline"
                      >
                        {p.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <th className="sticky left-0 bg-white px-4 py-3 font-semibold text-ink-muted">
                    Price
                  </th>
                  {selectedProducts.map((p) => (
                    <td
                      key={p.slug}
                      className="tabular-price px-4 py-3 font-semibold text-price"
                    >
                      {p.priceDisplay ?? "—"}
                    </td>
                  ))}
                </tr>
                {keys.map((k) => {
                  const values = selectedProducts.map((p) =>
                    String(p.specs?.[k] ?? "—"),
                  );
                  const highlight = new Set(values).size > 1;
                  return (
                    <tr key={k} className="border-b border-border">
                      <th className="sticky left-0 bg-white px-4 py-3 font-semibold text-ink-muted">
                        {specLabel(k)}
                      </th>
                      {values.map((v, i) => (
                        <td
                          key={selectedProducts[i].slug}
                          className={cn(
                            "px-4 py-3 text-ink",
                            highlight && "bg-amber/8 font-medium",
                          )}
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <WhatsAppButton
              message={`Hi, I compared these machines and need a recommendation: ${selectedProducts.map((p) => p.name).join(" vs ")}`}
              className="tap-target inline-flex items-center justify-center rounded-lg bg-whatsapp px-5 py-3 text-sm font-bold text-white"
            >
              Ask which fits me
            </WhatsAppButton>
            <Link
              href="/quote"
              className="tap-target inline-flex items-center justify-center rounded-lg border border-border bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-surface"
            >
              Get a quote
            </Link>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-ink-muted">
          Select at least two machines above — or tap a ready comparison.
        </p>
      )}
    </div>
  );
}
