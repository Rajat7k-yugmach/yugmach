import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getCaseStudies } from "@/lib/api/catalogue";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Case studies - packing machine buyers",
  description:
    "How manufacturers use YugMach packing machines - results from real floors.",
  path: "/case-studies",
  withHreflang: false,
});

export default async function CaseStudiesPage() {
  const items = await getCaseStudies();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-10">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: "Case studies" }]}
      />
      <div className="mt-4 max-w-2xl">
        <p className="section-label text-amber-text">Proof</p>
        <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
          Case studies
        </h1>
        <p className="mt-3 text-ink-muted">
          Short stories from buyers - what they packed, what changed, and the
          result on the floor.
        </p>
      </div>

      {items.length ? (
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {items.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/case-studies/${c.slug}`}
                className="group flex h-full flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-amber-text">
                  {[c.industry, c.customerCity].filter(Boolean).join(" · ") ||
                    "Buyer story"}
                </p>
                <h2 className="font-display mt-2 text-xl font-extrabold tracking-tight text-ink group-hover:underline">
                  {c.customerName}
                </h2>
                {c.challenge ? (
                  <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
                    {c.challenge}
                  </p>
                ) : null}
                {c.results ? (
                  <p className="mt-3 line-clamp-3 flex-1 text-sm font-medium leading-relaxed text-ink">
                    {c.results}
                  </p>
                ) : null}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-trust">
                  Read story
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface px-5 py-8 text-center">
          <p className="font-display text-lg font-extrabold text-ink">
            Stories coming soon
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Meanwhile, browse machines or ask for a buyer reference on WhatsApp.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="rounded-lg bg-amber px-5 py-2.5 text-sm font-bold text-white"
            >
              Catalogue
            </Link>
            <WhatsAppButton
              message="Hi, can you share a buyer reference for my product?"
              className="rounded-lg bg-whatsapp px-5 py-2.5 text-sm font-bold text-white"
            >
              Ask for reference
            </WhatsAppButton>
          </div>
        </div>
      )}
    </main>
  );
}
