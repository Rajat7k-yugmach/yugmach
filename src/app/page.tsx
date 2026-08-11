import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Package,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { ApplicationCategoryGrid } from "@/components/ApplicationCategoryGrid";
import { CategoryMarquee } from "@/components/CategoryMarquee";
import { CoverageTrustSection } from "@/components/CoverageTrustSection";
import { HeroApplicationMosaic } from "@/components/HeroApplicationMosaic";
import { HeroMetrics } from "@/components/HeroMetrics";
import { HomeMachineFinder } from "@/components/HomeMachineFinder";
import { ProductCard } from "@/components/ProductCard";
import { StickyCtaBar } from "@/components/StickyCtaBar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  getApplications,
  getBlogPosts,
  getFinderSteps,
  getProducts,
  getTestimonials,
} from "@/lib/api/catalogue";
import { buildPageMetadata } from "@/lib/seo";
import { waMessageGeneric } from "@/lib/whatsapp";

/** Demand-led mosaic order (reviews mention spice / namkeen most). */
const MOSAIC_PREFERRED = ["masala", "namkeen", "powder", "snacks", "kurkure", "biscuit"];

export const metadata: Metadata = buildPageMetadata({
  title: "Packing Machine Price in India — Published Rates",
  description:
    "Buy packing machines for namkeen, masala, powder, snacks and more. Published prices, India-wide delivery. Find your machine by product in under a minute.",
  path: "/",
});

const INDIA_HUBS = [
  "Delhi NCR",
  "Agra",
  "Indore",
  "Ahmedabad",
  "Pune",
  "Hyderabad",
  "Kolkata",
  "Lucknow",
];

export default async function HomePage() {
  const [products, apps, reviews, posts, finderSteps] = await Promise.all([
    getProducts(),
    getApplications(),
    getTestimonials().catch(() => []),
    getBlogPosts().catch(() => []),
    getFinderSteps().catch(() => []),
  ]);

  const steps = finderSteps as Parameters<typeof HomeMachineFinder>[0]["steps"];

  const heroProduct =
    products.find((p) => p.slug === "2400-pph-namkeen-packing-machine") ||
    products.find((p) => p.isFeatured && p.primaryImage) ||
    products.find((p) => p.primaryImage) ||
    products[0];

  const featured = [
    ...(heroProduct ? [heroProduct] : []),
    ...products.filter((p) => p.slug !== heroProduct?.slug && p.primaryImage),
  ]
    .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i)
    .slice(0, 8);

  const productsByApp = new Map<string, typeof products>();
  for (const p of products) {
    for (const app of p.applications || []) {
      const slug = typeof app === "string" ? app : app.slug;
      if (!slug) continue;
      const list = productsByApp.get(slug) || [];
      list.push(p);
      productsByApp.set(slug, list);
    }
  }

  function appImage(slug: string, heroImage?: string | null) {
    const matched = productsByApp.get(slug) || [];
    // Prefer the spice line for masala — strongest review signal
    if (slug === "masala") {
      const spice =
        products.find((p) => p.slug === "2400-pph-automatic-spice-packing-machine") ||
        products.find((p) => p.slug.includes("spice") && p.primaryImage);
      if (spice?.primaryImage?.url) return spice.primaryImage.url;
    }
    return (
      heroImage ||
      matched.find((p) => p.primaryImage)?.primaryImage?.url ||
      matched[0]?.primaryImage?.url ||
      null
    );
  }

  const appsWithImages = apps
    .map((a) => ({
      slug: a.slug,
      name: a.name,
      imageUrl: appImage(a.slug, a.heroImage),
      priceMinDisplay: a.priceMinDisplay,
      priceMaxDisplay: a.priceMaxDisplay,
      productCount: a.productCount || productsByApp.get(a.slug)?.length || 0,
      blurb: a.intro?.slice(0, 120) || undefined,
    }))
    .sort((a, b) => Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl)));

  const bySlug = new Map(appsWithImages.map((a) => [a.slug, a]));
  const mosaicApps = [
    ...MOSAIC_PREFERRED.map((s) => bySlug.get(s)).filter(
      (a): a is (typeof appsWithImages)[number] => Boolean(a?.imageUrl),
    ),
    ...appsWithImages.filter(
      (a) => a.imageUrl && !MOSAIC_PREFERRED.includes(a.slug),
    ),
  ].slice(0, 4);

  const categoryApps = [
    ...mosaicApps,
    ...appsWithImages.filter(
      (a) => a.imageUrl && !mosaicApps.some((m) => m.slug === a.slug),
    ),
  ].slice(0, 6);

  const marqueeItems = apps
    .filter((a) => (a.productCount || productsByApp.get(a.slug)?.length || 0) > 0)
    .map((a) => ({ slug: a.slug, name: a.name }));

  const reviewCities = Array.from(
    new Set(reviews.map((r) => r.city).filter(Boolean)),
  ).slice(0, 6);

  const homePosts = posts.slice(0, 3);

  return (
    <main>
      {/* Hero — copy + mosaic left, finder right */}
      <section
        id="machine-finder"
        className="relative overflow-hidden border-b border-border bg-surface"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(850px 420px at 12% 8%, rgba(249,115,22,0.12), transparent 62%), radial-gradient(700px 380px at 88% 18%, rgba(15,61,117,0.08), transparent 58%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pt-6 pb-8 md:pt-8 md:pb-10 lg:pt-10 lg:pb-12">
          <div className="grid items-start gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:gap-x-10 lg:gap-y-0 xl:gap-x-12">
            {/* Copy */}
            <div className="reveal min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted shadow-sm backdrop-blur">
                <span className="size-2 rounded-full bg-amber shadow-[0_0_0_4px_rgba(249,115,22,0.14)]" />
                Industrial packing machines · India
              </span>
              <h1 className="font-display mt-3 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight text-ink md:text-5xl lg:text-[3.25rem]">
                Packing machines for{" "}
                <span className="bg-gradient-to-r from-amber-hover via-amber to-[#f59e0b] bg-clip-text text-transparent">
                  your product line
                </span>
                .
              </h1>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-ink-muted md:text-lg">
                Namkeen, masala, powder, snacks — published prices, India-wide delivery.
              </p>
              <div className="mt-5">
                <WhatsAppButton
                  message={waMessageGeneric()}
                  placement="hero"
                  className="tap-target inline-flex items-center justify-center rounded-lg bg-whatsapp px-5 py-3 text-sm font-bold text-white"
                >
                  Get Price on WhatsApp
                </WhatsAppButton>
              </div>
            </div>

            {/* Finder — nudged down to sit with mosaic */}
            <div
              id="finder-panel"
              className="reveal scroll-mt-24 lg:row-span-2 lg:mt-10"
            >
              <HomeMachineFinder
                applications={apps.map((a) => ({ slug: a.slug, name: a.name }))}
                steps={steps}
                highlighted
              />
            </div>

            {/* Mosaic — under heading on left */}
            <div className="reveal max-w-lg lg:mt-8">
              <HeroApplicationMosaic apps={mosaicApps} />
            </div>
          </div>
        </div>
      </section>

      <CategoryMarquee
        items={marqueeItems}
        eyebrow="Live categories on the catalogue"
      />

      {/* Applications — OldMachine CategoryGrid style */}
      <ApplicationCategoryGrid apps={categoryApps} />

      {/* Spec strip */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
          <HeroMetrics
            metrics={[
              { value: products.length || 55, suffix: "+", label: "Machine models" },
              { value: 2400, suffix: "", label: "PPH namkeen line" },
              { value: 4.9, suffix: "★", label: "IndiaMART" },
              { value: 40, suffix: "", label: "Verified reviews" },
            ]}
          />
        </div>
      </section>

      {/* Featured machines */}
      <section className="border-b border-border bg-surface py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-label text-amber-text">Catalogue</p>
              <h2 className="font-display mt-1 text-2xl font-extrabold md:text-3xl">
                Featured packing machines
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Published prices. GST extra. India-wide delivery.
              </p>
            </div>
            <Link
              href="/products"
              className="tap-target inline-flex items-center justify-center rounded-lg bg-amber px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_22px_rgba(249,115,22,0.25)] hover:bg-amber-hover"
            >
              Full catalogue
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {featured.map((p) => (
              <li key={p.slug} className="reveal h-full">
                <ProductCard product={p} showPouch={false} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CoverageTrustSection
        machineCount={products.length || 55}
        reviewCities={reviewCities.map((c) => String(c).split(",")[0])}
        fallbackCities={INDIA_HUBS}
        reviews={reviews.map((r) => ({
          customerName: r.customerName,
          city: r.city,
          text: r.text,
        }))}
      />

      {/* Demo + after-sales */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-7 md:py-9">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
            <div className="min-w-0 max-w-xl">
              <p className="section-label text-amber-text">Before you buy</p>
              <h2 className="font-display mt-1 text-xl font-extrabold tracking-tight text-ink md:text-2xl">
                Demo with your material
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted md:text-[15px]">
                We pack your product, film it, and send the video on WhatsApp —
                before you buy.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <WhatsAppButton
                message="Hi, I need a demo video with my product. My product is: "
                placement="hero"
                className="tap-target inline-flex items-center justify-center rounded-lg bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white"
              >
                Request demo
              </WhatsAppButton>
              <Link
                href="/videos"
                className="tap-target inline-flex items-center justify-center gap-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface"
              >
                Watch videos
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </div>

          <ul className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-x-6 md:mt-8 md:grid-cols-4 md:gap-x-8">
            {[
              {
                t: "Install & train",
                d: "Operators signed off",
                href: "/service/installation",
                Icon: Wrench,
              },
              {
                t: "Spare parts",
                d: "Jaws, collars, cups",
                href: "/spares",
                Icon: Package,
              },
              {
                t: "AMC & warranty",
                d: "India-wide coverage",
                href: "/service",
                Icon: ShieldCheck,
              },
              {
                t: "Machine advisor",
                d: "Match in 3 questions",
                href: "/advisor",
                Icon: Compass,
              },
            ].map(({ t, d, href, Icon }) => (
              <li key={t}>
                <Link href={href} className="group block">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-amber/12 text-amber-text transition group-hover:bg-amber/20">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="mt-2.5 block text-sm font-semibold text-ink group-hover:underline">
                    {t}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">{d}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {homePosts.length ? (
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="section-label text-amber-text">Guides</p>
                <h2 className="font-display mt-1 text-2xl font-extrabold md:text-3xl">
                  Buyer guides &amp; blog
                </h2>
                <p className="mt-1 max-w-xl text-sm text-ink-muted">
                  Price bands, filler types, and how to choose — before you buy.
                </p>
              </div>
              <Link
                href="/blog"
                className="tap-target inline-flex items-center gap-1 text-sm font-bold text-amber-text hover:underline"
              >
                All articles
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>

            <ul className="mt-7 grid gap-4 md:grid-cols-3">
              {homePosts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex h-full flex-col rounded-xl border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-amber hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
                  >
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-amber-text">
                      {p.readingMins ? `${p.readingMins} min read` : "Guide"}
                    </p>
                    <h3 className="font-display mt-2 text-lg font-extrabold leading-snug tracking-tight text-ink group-hover:underline">
                      {p.title}
                    </h3>
                    {p.excerpt ? (
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-muted">
                        {p.excerpt}
                      </p>
                    ) : null}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-trust">
                      Read
                      <ArrowRight
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <StickyCtaBar message={waMessageGeneric()} />
    </main>
  );
}
