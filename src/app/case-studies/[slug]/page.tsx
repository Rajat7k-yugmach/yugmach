import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Target,
} from "lucide-react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getCaseStudies, getCaseStudy } from "@/lib/api/catalogue";
import { buildPageMetadata } from "@/lib/seo";
import { displayTitle } from "@/lib/typography";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    return (await getCaseStudies()).map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCaseStudy(slug);
  if (!c) return { title: "Case study" };
  return buildPageMetadata({
    title: `${c.customerName} - case study`,
    description: (c.results || c.challenge || "").slice(0, 160),
    path: `/case-studies/${slug}`,
  });
}

const SECTIONS = [
  {
    key: "challenge" as const,
    label: "Challenge",
    Icon: Target,
    testId: "case-challenge",
  },
  {
    key: "solution" as const,
    label: "Solution",
    Icon: Lightbulb,
    testId: "case-solution",
  },
  {
    key: "results" as const,
    label: "Results",
    Icon: CheckCircle2,
    testId: "case-results",
  },
] as const;

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const c = await getCaseStudy(slug);
  if (!c) notFound();

  const metaBits = [c.industry, c.customerCity].filter(Boolean);
  const metricEntries = Object.entries(c.metrics || {}).filter(
    ([, v]) => v != null && String(v).trim() !== "",
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/case-studies", label: "Case studies" },
          { label: c.customerName },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="section-label text-amber-text">Buyer story</p>
        <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
          {displayTitle(c.customerName)}
        </h1>
        {metaBits.length ? (
          <p className="mt-3 text-base text-ink-muted">
            {metaBits.join(" · ")}
          </p>
        ) : null}
      </header>

      {metricEntries.length ? (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {metricEntries.map(([key, value]) => (
            <li
              key={key}
              className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm"
            >
              <p className="spec-label text-ink-muted">
                {key.replace(/_/g, " ")}
              </p>
              <p className="font-display mt-1 text-lg font-extrabold text-ink">
                {String(value)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {SECTIONS.map(({ key, label, Icon, testId }) => (
          <section
            key={key}
            data-testid={testId}
            className="card-elevated flex flex-col p-5 md:p-6"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-amber-wash text-amber-text">
                <Icon className="size-4" aria-hidden />
              </span>
              <h2 className="font-display text-lg font-extrabold text-ink">
                {label}
              </h2>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted md:text-base">
              {c[key]}
            </p>
          </section>
        ))}
      </div>

      {c.products?.length ? (
        <section className="mt-12">
          <p className="section-label text-amber-text">Machines used</p>
          <h2 className="font-display mt-1 text-2xl font-extrabold tracking-tight text-ink">
            Related packing machines
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.products.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-12 rounded-2xl border border-border bg-amber-wash px-5 py-6 md:px-8">
        <p className="font-display text-lg font-extrabold text-ink">
          Ask for a similar setup
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Tell us what you pack and your target speed — we will suggest a line and share a published price band.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <WhatsAppButton
            message={`Hi, I saw the ${c.customerName} case study and want a similar packing setup`}
            className="tap-target inline-flex items-center justify-center rounded-lg bg-whatsapp px-5 py-3 text-sm font-bold text-white"
          >
            Ask on WhatsApp
          </WhatsAppButton>
          <Link
            href="/case-studies"
            className="tap-target inline-flex items-center gap-1 rounded-lg border border-border bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-surface"
          >
            More stories
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </main>
  );
}
