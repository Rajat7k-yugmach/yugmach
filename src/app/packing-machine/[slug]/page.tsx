import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ChevronRight } from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { MachineImage } from "@/components/MachineImage";
import { ProductCard } from "@/components/ProductCard";
import { StickyCtaBar } from "@/components/StickyCtaBar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  getApplication,
  getApplications,
  type ProductListItem,
} from "@/lib/api/catalogue";
import { buildPageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { waMessageForApplication } from "@/lib/whatsapp";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    return (await getApplications()).map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getApplication(slug);
  if (!a) return { title: "Not found" };
  const name = a.name;
  const title = a.priceMinDisplay
    ? `${name} Packing Machine Price in India`
    : `${name} Packing Machine`;
  const description =
    `${name} packing machine${a.priceMinDisplay ? ` from ${a.priceMinDisplay}` : ""}. ${a.productCount || a.products?.length || 0} models. Published prices, GST extra. India-wide delivery.`.slice(
      0,
      160,
    );
  return buildPageMetadata({
    title,
    description,
    path: `/packing-machine/${slug}`,
    image: a.heroImage || a.products?.[0]?.primaryImage?.url || "/brand-logo.png",
  });
}

function capacityHint(p: ProductListItem): string | null {
  const specs = p.specs || {};
  const pph = specs.capacity_pph ?? specs.CAPACITY_PPH;
  const ppm = specs.capacity_ppm ?? specs.CAPACITY_PPM;
  if (pph != null) return `${Number(pph).toLocaleString("en-IN")} PPH`;
  if (ppm != null) return `${Number(ppm).toLocaleString("en-IN")} PPM`;
  return null;
}

/** Turn long CMS prose into short scannable pointers. */
function toPointers(...blocks: Array<string | null | undefined>): string[] {
  const raw = blocks.filter(Boolean).join("\n");
  if (!raw.trim()) return [];

  const parts = raw
    .split(/\n+|•|\u2022|(?<=[.!?])\s+(?=[A-Z0-9“"‘])/)
    .map((s) =>
      s
        .replace(/^[-–—*]\s*/, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((s) => s.length >= 24 && s.length <= 160);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase().slice(0, 48);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p.replace(/\.$/, ""));
    if (out.length >= 6) break;
  }
  return out;
}

function FeaturedMachine({ product }: { product: ProductListItem }) {
  const cap = capacityHint(product);
  return (
    <article className="grid overflow-hidden border border-border bg-white md:grid-cols-[minmax(0,42%)_1fr]">
      <Link href={`/products/${product.slug}`} className="block bg-surface-sunken">
        <MachineImage
          image={product.primaryImage}
          name={product.name}
          capacityHint={cap}
          className="rounded-none"
          priority
          sizes="(max-width: 768px) 100vw, 42vw"
        />
      </Link>
      <div className="flex flex-col justify-center gap-4 p-4 sm:p-5 md:p-6">
        <div>
          {cap ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-text">
              {cap}
            </p>
          ) : null}
          <Link
            href={`/products/${product.slug}`}
            className="mt-1 block text-xl font-semibold tracking-tight text-ink hover:underline md:text-2xl"
          >
            {product.name}
          </Link>
          {product.shortDescription ? (
            <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
              {product.shortDescription}
            </p>
          ) : null}
        </div>

        <div>
          <p className="tabular-price text-3xl font-semibold text-price">
            {product.priceDisplay ?? "Price on request"}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">
            /{product.priceUnit} · GST extra
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <WhatsAppButton
            message={`Hi, I need the price and details for ${product.name}.`}
            placement="product_card"
            className="tap-target inline-flex flex-1 items-center justify-center rounded-md bg-whatsapp px-4 py-3 text-sm font-semibold text-white sm:flex-none sm:min-w-[10rem]"
          >
            Get Price on WhatsApp
          </WhatsAppButton>
          <Link
            href={`/products/${product.slug}`}
            className="tap-target inline-flex items-center justify-center rounded-md border border-border px-4 py-3 text-sm font-semibold text-ink hover:bg-surface-sunken"
          >
            Full specs
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function ApplicationPage({ params }: Props) {
  const { slug } = await params;
  const [app, allApps] = await Promise.all([
    getApplication(slug),
    getApplications().catch(() => []),
  ]);
  if (!app) notFound();

  const wa = waMessageForApplication(app.name);
  const products = app.products ?? [];
  const related =
    app.relatedApplications?.filter((a) => a.slug !== app.slug).slice(0, 8) ||
    allApps.filter((a) => a.slug !== app.slug).slice(0, 8);

  const priceLabel =
    app.priceMinDisplay && app.priceMaxDisplay
      ? app.priceMinDisplay === app.priceMaxDisplay
        ? app.priceMinDisplay
        : `${app.priceMinDisplay} – ${app.priceMaxDisplay}`
      : app.priceMinDisplay || null;

  const single = products.length === 1;
  const pointers = toPointers(app.productChallenges, app.body, app.intro);

  const glance: string[] = [];
  if (app.typicalPouchSizes?.length) {
    glance.push(`Typical pouch: ${app.typicalPouchSizes.slice(0, 3).join(", ")}`);
  }
  if (app.typicalFilmTypes?.length) {
    glance.push(`Film: ${app.typicalFilmTypes.slice(0, 2).join(", ")}`);
  }
  glance.push("India-wide delivery");
  glance.push("Trial run on your material before you pay");
  if (app.recommendedFillType) {
    glance.push(`Recommended fill: ${app.recommendedFillType}`);
  }

  const faqLd = app.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: app.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Applications",
        item: absoluteUrl("/packing-machine"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: app.name,
        item: absoluteUrl(`/packing-machine/${app.slug}`),
      },
    ],
  };

  const itemListLd =
    products.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${app.name} packing machines`,
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(`/products/${p.slug}`),
            name: p.name,
          })),
        }
      : null;

  return (
    <main className="pb-28">
      {faqLd ? <JsonLd data={faqLd} /> : null}
      {itemListLd ? <JsonLd data={itemListLd} /> : null}
      <JsonLd data={breadcrumbLd} />

      {/* 1. Title strip — one job: name + where to act */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 md:py-5">
          <nav className="mb-2 flex flex-wrap items-center gap-1 text-xs text-ink-muted">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <ChevronRight className="size-3 opacity-50" aria-hidden />
            <Link href="/packing-machine" className="hover:text-ink">
              Applications
            </Link>
            <ChevronRight className="size-3 opacity-50" aria-hidden />
            <span className="text-ink">{app.name}</span>
          </nav>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                {app.h1}
              </h1>
              <p className="mt-1.5 text-sm text-ink-muted">
                {[
                  priceLabel ? `From ${priceLabel}` : null,
                  `${app.productCount || products.length || 0} model${
                    (app.productCount || products.length) === 1 ? "" : "s"
                  }`,
                  "GST extra",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <WhatsAppButton
                message={wa}
                placement="hero"
                className="tap-target inline-flex items-center justify-center rounded-md bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white"
              >
                Get Price on WhatsApp
              </WhatsAppButton>
              <Link
                href="/machine-finder"
                className="tap-target inline-flex items-center gap-1 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-sunken"
              >
                Find my machine
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Machines — primary focus */}
      <section id="machines" className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-5 md:py-6">
          {products.length === 0 ? (
            <div className="border border-dashed border-border bg-white px-5 py-8 text-center">
              <p className="font-semibold text-ink">No published model yet</p>
              <p className="mt-1 text-sm text-ink-muted">
                Share product, pouch size, and speed — we configure one.
              </p>
              <WhatsAppButton
                message={wa}
                placement="hero"
                className="tap-target mt-4 inline-flex rounded-md bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white"
              >
                Ask on WhatsApp
              </WhatsAppButton>
            </div>
          ) : single ? (
            <FeaturedMachine product={products[0]} />
          ) : products.length <= 2 ? (
            <ul className="space-y-3">
              {products.map((p) => (
                <li key={p.slug}>
                  <FeaturedMachine product={p} />
                </li>
              ))}
            </ul>
          ) : (
            <>
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-ink">
                  Choose a model
                </h2>
                <span className="text-xs tabular-nums text-ink-muted">
                  {products.length} listed
                </span>
              </div>
              <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
                {products.map((p) => (
                  <li key={p.slug} className="h-full">
                    <ProductCard product={p} showPouch={false} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      {/* 3. At a glance + buying pointers — scannable, full width */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 md:grid-cols-2 md:gap-10 md:py-7">
          <div>
            <h2 className="text-base font-semibold text-ink">At a glance</h2>
            <ul className="mt-3 space-y-2">
              {glance.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-ink">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-amber-text"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {pointers.length > 0 ? (
            <div>
              <h2 className="text-base font-semibold text-ink">Before you buy</h2>
              <ul className="mt-3 space-y-2">
                {pointers.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-ink-muted">
                    <span
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-ink/35"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <h2 className="text-base font-semibold text-ink">Need a custom config?</h2>
              <p className="mt-2 text-sm text-ink-muted">
                Send product type, pouch size, and target speed on WhatsApp — we
                match the machine.
              </p>
              <WhatsAppButton
                message={wa}
                placement="faq"
                className="tap-target mt-3 inline-flex rounded-md bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white"
              >
                WhatsApp us
              </WhatsAppButton>
            </div>
          )}
        </div>
      </section>

      {/* 4. FAQ + related — softer, less box chrome */}
      {(app.faqs?.length || related.length) ? (
        <section className="border-b border-border bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 md:gap-10 md:py-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            {app.faqs?.length ? (
              <div className="min-w-0">
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-semibold tracking-tight text-ink">
                    Common questions
                  </h2>
                  <WhatsAppButton
                    message={wa}
                    placement="faq"
                    className="text-xs font-semibold text-whatsapp hover:underline"
                  >
                    Ask on WhatsApp
                  </WhatsAppButton>
                </div>
                <div className="space-y-1">
                  {app.faqs.slice(0, 6).map((f, i) => (
                    <details
                      key={i}
                      className="group rounded-xl px-1 open:bg-surface/80 open:px-3 open:py-1"
                      open={i === 0}
                    >
                      <summary className="cursor-pointer list-none py-3 text-sm font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                        <span className="flex items-start justify-between gap-3">
                          <span className="leading-snug">{f.question}</span>
                          <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-ink-muted transition group-open:bg-amber/15 group-open:text-amber-text">
                            <ChevronRight className="size-3.5 transition group-open:rotate-90" />
                          </span>
                        </span>
                      </summary>
                      <p className="pb-3 pr-8 text-sm leading-relaxed text-ink-muted">
                        {f.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ) : null}

            {related.length ? (
              <div className="min-w-0">
                <div className="mb-4 flex items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold tracking-tight text-ink">
                    Also packing
                  </h2>
                  <Link
                    href="/packing-machine"
                    className="text-xs font-semibold text-ink-muted hover:text-ink hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {related.slice(0, 8).map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/packing-machine/${a.slug}`}
                        className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition hover:bg-surface"
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-ink group-hover:underline">
                            {a.name}
                          </span>
                          {a.priceMinDisplay ? (
                            <span className="mt-0.5 block text-xs text-ink-muted">
                              from {a.priceMinDisplay}
                            </span>
                          ) : null}
                        </span>
                        <ChevronRight
                          className="size-4 shrink-0 text-ink-muted opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <StickyCtaBar message={wa} />
    </main>
  );
}
