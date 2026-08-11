"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { PackageCheck, Ship, Star, Video, Wrench } from "lucide-react";

type Review = {
  customerName: string;
  city?: string | null;
  text: string;
};

type Props = {
  machineCount: number;
  reviewCities: string[];
  fallbackCities: string[];
  reviews: Review[];
};

const REGIONS = ["North", "West", "Central", "South", "East"] as const;

const STEPS = [
  { t: "Match", d: "Right machine for your product", Icon: PackageCheck },
  { t: "Demo", d: "Video with your material", Icon: Video },
  { t: "Ship", d: "Dispatch across India", Icon: Ship },
  { t: "Support", d: "Spares & AMC follow", Icon: Wrench },
];

export function CoverageTrustSection({
  machineCount,
  reviewCities,
  fallbackCities,
  reviews,
}: Props) {
  const reduce = useReducedMotion();
  const cities = (reviewCities.length ? reviewCities : fallbackCities).slice(0, 8);
  const topReviews = reviews.slice(0, 3);

  return (
    <section className="border-b border-border bg-surface-sunken py-8 md:py-10">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid md:grid-cols-[1.05fr_0.95fr]">
            {/* Left — copy + coverage chips */}
            <div className="flex flex-col justify-center gap-3 border-b border-border p-5 md:border-b-0 md:border-r md:p-6">
              <div>
                <p className="section-label">Coverage & trust</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink md:text-[1.75rem]">
                  India-wide delivery.
                </h2>
                <p className="mt-2 text-sm text-ink-muted md:text-base">
                  One workshop for machines, demos, spares, and service.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {REGIONS.map((region) => (
                  <span
                    key={region}
                    className="rounded-full bg-surface-sunken px-3 py-1.5 text-xs font-semibold text-ink"
                  >
                    {region}
                  </span>
                ))}
              </div>

              {cities.length > 0 ? (
                <p className="text-xs leading-relaxed text-ink-muted md:text-sm">
                  Recent installs: {cities.join(", ")}
                </p>
              ) : null}

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <Link
                  href="/locations"
                  className="tap-target inline-flex items-center justify-center rounded-full bg-amber px-4 py-2.5 text-sm font-semibold text-amber-ink"
                >
                  View cities
                </Link>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span className="font-semibold tabular-nums text-ink">
                    4.9★ <span className="font-normal text-ink-muted">IndiaMART</span>
                  </span>
                  <span className="font-semibold tabular-nums text-ink">
                    {machineCount || 55}+{" "}
                    <span className="font-normal text-ink-muted">models</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right — journey as dense 2×2 */}
            <ul className="grid grid-cols-2">
              {STEPS.map((s, i) => (
                <motion.li
                  key={s.t}
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.05 }}
                  className={`flex min-h-[7.5rem] flex-col justify-center gap-3 p-5 md:min-h-[9rem] md:gap-3.5 md:p-6 ${
                    i % 2 === 0 ? "border-r border-border" : ""
                  } ${i < 2 ? "border-b border-border" : ""}`}
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-amber/15 text-amber-text md:size-12">
                    <s.Icon className="size-5 md:size-6" aria-hidden />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-ink md:text-lg">
                      <span className="text-amber-text">{String(i + 1).padStart(2, "0")}</span>{" "}
                      {s.t}
                    </p>
                    <p className="mt-1 text-sm leading-snug text-ink-muted md:text-[0.95rem]">
                      {s.d}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Reviews — compact strip inside same card */}
          {topReviews.length > 0 ? (
            <div className="grid gap-0 border-t border-border md:grid-cols-3">
              {topReviews.map((r, i) => (
                <blockquote
                  key={`${r.customerName}-${i}`}
                  className={`p-4 md:p-5 ${i < topReviews.length - 1 ? "border-b border-border md:border-b-0 md:border-r" : ""}`}
                >
                  <div className="flex gap-0.5 text-amber" aria-hidden>
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className="size-3 fill-current" />
                    ))}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{r.text}</p>
                  <footer className="mt-2 text-xs font-semibold text-ink">
                    {r.customerName}
                    {r.city ? (
                      <span className="font-normal text-ink-muted"> · {r.city}</span>
                    ) : null}
                  </footer>
                </blockquote>
              ))}
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
