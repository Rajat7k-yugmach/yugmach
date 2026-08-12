import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Check, Factory, FileDown, Package, Wrench, X } from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { StickyCtaBar } from "@/components/StickyCtaBar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { YouTubeFacade } from "@/components/YouTubeFacade";
import { getProduct, getProducts } from "@/lib/api/catalogue";
import { apiUrl } from "@/lib/api/client";
import { buildPageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { waMessageForProduct } from "@/lib/whatsapp";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string; previewSecret?: string }>;
};

export async function generateStaticParams() {
  try {
    return (await getProducts()).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Not found" };
  const title = p.priceDisplay
    ? `${p.name} — ${p.priceDisplay}`
    : `${p.name} | Price in India`;
  const description = (
    p.shortDescription ||
    `${p.name} packing machine${p.priceDisplay ? ` priced at ${p.priceDisplay}` : ""}. Published price, GST extra. India-wide delivery from YugMach.`
  ).slice(0, 160);
  return buildPageMetadata({
    title,
    description,
    path: `/products/${slug}`,
    image: p.primaryImage?.url || "/brand-logo.png",
  });
}

function appLabel(a: string | { slug: string; name: string }): { slug: string; name: string } {
  if (typeof a === "string") return { slug: a, name: a };
  return a;
}

function mtName(mt: string | { slug: string; name: string } | null | undefined): string | null {
  if (!mt) return null;
  return typeof mt === "string" ? mt : mt.name || mt.slug;
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview, previewSecret } = await searchParams;
  const cookieStore = await cookies();
  const secret = process.env.REVALIDATE_SECRET || process.env.PREVIEW_SECRET || "";
  const secretOk = Boolean(secret && previewSecret && previewSecret === secret);

  // Prefer signed preview secret. Cookie alone is not enough (can be forged/stale).
  let sessionOk = false;
  if (!secretOk && preview === "1") {
    try {
      const { getPayload } = await import("@/lib/payload/getPayload");
      const payload = await getPayload();
      const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");
      const { user } = await payload.auth({
        headers: new Headers({
          cookie: cookieHeader,
        }),
      });
      sessionOk = Boolean(user);
    } catch {
      sessionOk = false;
    }
  }

  const allowPreview = preview === "1" && (secretOk || sessionOk);

  const [product, allProducts] = await Promise.all([
    getProduct(slug, { preview: allowPreview }),
    getProducts().catch(() => []),
  ]);
  if (!product) notFound();

  const mtSlug =
    typeof product.machineType === "string"
      ? product.machineType
      : product.machineType?.slug || null;
  const mtLabel = mtName(product.machineType);
  const cap =
    product.specs?.capacity_pph != null
      ? `${Number(product.specs.capacity_pph).toLocaleString("en-IN")} PPH`
      : product.specs?.capacity_ppm != null
        ? `${Number(product.specs.capacity_ppm).toLocaleString("en-IN")} PPM`
        : null;
  const wa = waMessageForProduct(product.name, product.slug);
  const apps = (product.applications || []).map(appLabel);
  const priceInr = product.pricePaise != null ? product.pricePaise / 100 : null;

  const galleryImages = [
    ...(product.primaryImage ? [product.primaryImage] : []),
    ...(product.images || []).filter((img) => img.url !== product.primaryImage?.url),
  ];

  const related =
    product.relatedProducts
      ?.map((r) => allProducts.find((p) => p.slug === r.slug) || null)
      .filter(Boolean)
      .slice(0, 4) ||
    allProducts.filter((p) => p.slug !== product.slug && p.primaryImage).slice(0, 4);

  const summarySpecs: Array<{ id: string; label: string; value: string }> = [];
  if (cap) summarySpecs.push({ id: "capacity", label: "Capacity", value: cap });
  if (mtLabel) summarySpecs.push({ id: "type", label: "Type", value: mtLabel });
  if (product.specGroups?.length) {
    for (const g of product.specGroups) {
      for (const f of g.fields.filter((x) => x.showInSummary)) {
        if (summarySpecs.length >= 6) break;
        const labelNorm = f.label.trim().toLowerCase();
        if (summarySpecs.some((s) => s.label.trim().toLowerCase() === labelNorm)) {
          continue;
        }
        summarySpecs.push({
          id: f.key || `${g.group}-${f.label}`,
          label: f.label,
          value: `${f.displayValue}${f.unit ? ` ${f.unit}` : ""}`,
        });
      }
    }
  }

  const offerLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.name,
    image: product.primaryImage?.url ? [product.primaryImage.url] : [absoluteUrl("/brand-logo.png")],
    sku: product.slug,
    brand: { "@type": "Brand", name: "YugMach" },
    manufacturer: { "@type": "Organization", name: "YugMach" },
    offers:
      priceInr != null
        ? {
            "@type": "Offer",
            url: absoluteUrl(`/products/${product.slug}`),
            priceCurrency: "INR",
            price: Math.round(priceInr),
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "YugMach" },
          }
        : {
            "@type": "Offer",
            url: absoluteUrl(`/products/${product.slug}`),
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: "YugMach" },
          },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Products", item: absoluteUrl("/products") },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: absoluteUrl(`/products/${product.slug}`),
      },
    ],
  };

  const defaultFaqs = [
    {
      question: `What is the price of ${product.name}?`,
      answer: product.priceDisplay
        ? `Published configuration price is ${product.priceDisplay} (GST extra). Final price depends on filler, pouch size and speed — confirm on WhatsApp.`
        : "Ask on WhatsApp for the current configuration price.",
    },
    {
      question: "Will this machine pack my product?",
      answer:
        "We run a trial with your material and share a video before you pay.",
    },
    {
      question: "Is installation and training included?",
      answer:
        "Documented handover is available. Operators are trained before sign-off. Confirm scope for your city on WhatsApp.",
    },
    {
      question: "How fast can I get spare parts?",
      answer:
        "Common jaws, collars and cups are stocked for quick dispatch. Ask lead time for your model before you buy.",
    },
  ];
  const faqs = product.faqs?.length ? product.faqs : defaultFaqs;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const specRows =
    product.specGroups?.flatMap((g) =>
      g.fields.map((f) => ({
        key: f.key,
        label: f.label,
        value: `${f.displayValue}${f.unit ? ` ${f.unit}` : ""}`,
      })),
    ) ||
    Object.entries(product.specs || {})
      .slice(0, 16)
      .map(([k, v]) => ({
        key: k,
        label: k.replace(/_/g, " "),
        value: String(v),
      }));

  return (
    <main className="pb-28">
      <JsonLd data={offerLd} />
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={faqLd} />

      {allowPreview && (
        <div
          className="border-b border-amber bg-amber/15 px-4 py-2 text-center text-sm text-ink"
          data-testid="product-preview-banner"
        >
          Admin preview{product.status !== "published" ? ` · status: ${product.status}` : ""} — not
          a public index view
        </div>
      )}

      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-4 md:py-6">
          <nav className="mb-4 text-sm text-ink-muted">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <Link href="/products" className="hover:text-ink">
              Products
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-ink">{product.name}</span>
          </nav>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-8">
            <ProductGallery
              name={product.name}
              images={galleryImages}
              capacityHint={cap}
              machineType={mtSlug}
            />

            <aside className="lg:sticky lg:top-20">
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
                <p className="section-label">
                  {[cap, "India-wide delivery"].filter(Boolean).join(" · ")}
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                  {product.name}
                </h1>
                {product.shortDescription ? (
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {product.shortDescription}
                  </p>
                ) : null}

                <div className="mt-5 border-t border-border pt-4">
                  <p className="tabular-price text-3xl font-semibold text-price md:text-4xl">
                    {product.priceDisplay ?? "Price on request"}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    /{product.priceUnit} · GST extra · confirm on WhatsApp
                  </p>
                </div>

                {summarySpecs.length > 0 ? (
                  <dl className="mt-4 grid grid-cols-2 gap-2">
                    {summarySpecs.slice(0, 4).map((s) => (
                      <div
                        key={s.id}
                        className="rounded-lg bg-surface-sunken px-3 py-2"
                      >
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                          {s.label}
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-ink">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {apps.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {apps.slice(0, 6).map((a) => (
                      <Link
                        key={a.slug}
                        href={`/packing-machine/${a.slug}`}
                        className="rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-medium text-ink hover:bg-amber/15"
                      >
                        {a.name}
                      </Link>
                    ))}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-col gap-2">
                  <WhatsAppButton
                    message={wa}
                    placement="price"
                    data-testid="product-primary-whatsapp"
                    className="tap-target inline-flex w-full items-center justify-center rounded-md bg-whatsapp px-5 py-3 font-semibold text-white"
                  >
                    Get Price on WhatsApp
                  </WhatsAppButton>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={apiUrl(`/api/v1/products/${product.slug}/spec-sheet.pdf`)}
                      data-testid="product-spec-sheet"
                      className="tap-target inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2.5 text-sm font-semibold"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileDown className="size-4" aria-hidden />
                      Spec sheet
                    </a>
                    <WhatsAppButton
                      message={`${wa} I need a demo video with my material.`}
                      placement="hero"
                      data-testid="product-request-demo-top"
                      className="tap-target inline-flex items-center justify-center rounded-md border border-border px-3 py-2.5 text-sm font-semibold"
                    >
                      Request demo
                    </WhatsAppButton>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:space-y-10 md:py-10">
        {/* Specs */}
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-label">Technical data</p>
              <h2 className="mt-1 text-xl font-semibold text-ink">Specifications</h2>
            </div>
            <WhatsAppButton
              message={`${wa} Please confirm if these specs fit my product.`}
              placement="spec_table"
              data-testid="product-specs-whatsapp"
              className="text-sm font-semibold text-trust underline"
            >
              Ask if this fits →
            </WhatsAppButton>
          </div>
          {specRows.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <tbody>
                  {specRows.map((row, i) => (
                    <tr
                      key={row.key}
                      className={i % 2 === 0 ? "bg-surface-sunken/60" : "bg-white"}
                    >
                      <th className="w-[42%] px-3 py-2.5 font-medium text-ink-muted md:px-4">
                        {row.label}
                      </th>
                      <td className="px-3 py-2.5 font-semibold tabular-nums text-ink md:px-4">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">
              Ask on WhatsApp for the full datasheet.
            </p>
          )}
        </section>

        {/* Demo + included */}
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
            <p className="section-label">Demo</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">See it run</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Request a clip with your material before you buy.
            </p>
            <div className="mt-4">
              <YouTubeFacade videoId="GAlvIxlmqf0" title={`${product.name} demo`} />
            </div>
            <WhatsAppButton
              message={`${wa} I need a demo video with my material.`}
              placement="hero"
              data-testid="product-request-demo-main"
              className="tap-target mt-4 inline-flex w-full items-center justify-center rounded-md bg-whatsapp px-4 py-3 text-sm font-semibold text-white"
            >
              Request demo with your material
            </WhatsAppButton>
          </section>

          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
            <p className="section-label">Scope</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">What&apos;s included</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-xl bg-surface-sunken p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Check className="size-4 text-success" aria-hidden />
                  Typically included
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
                  <li>Machine as configured</li>
                  <li>Operator training at handover</li>
                  <li>Warranty as on invoice</li>
                </ul>
              </div>
              <div className="rounded-xl bg-surface-sunken p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <X className="size-4 text-warning" aria-hidden />
                  Confirm separately
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
                  <li>GST, freight, travel</li>
                  <li>Compressor / air if needed</li>
                  <li>Film / laminate rolls</li>
                </ul>
              </div>
            </div>

            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                { href: "/spares", label: "Spares", Icon: Package },
                { href: "/service", label: "AMC", Icon: Wrench },
                { href: "/about/factory", label: "Factory", Icon: Factory },
              ].map((x) => (
                <li key={x.href}>
                  <Link
                    href={x.href}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold hover:border-amber"
                  >
                    <x.Icon className="size-4 text-trust" aria-hidden />
                    {x.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {product.description ? (
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
            <p className="section-label">Overview</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">About this machine</h2>
            <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
              {product.description}
            </p>
          </section>
        ) : null}

        {/* FAQ */}
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
          <p className="section-label">FAQ</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">Common questions</h2>
          <div className="mt-4 divide-y divide-border rounded-xl border border-border">
            {faqs.map((f, i) => (
              <details key={i} className="group px-4 py-1 open:bg-surface-sunken/40">
                <summary className="cursor-pointer list-none py-3 font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {f.question}
                    <span className="text-ink-muted transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="pb-3 text-sm leading-relaxed text-ink-muted">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related */}
        {related.length > 0 ? (
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="section-label">Catalogue</p>
                <h2 className="mt-1 text-xl font-semibold text-ink">Similar machines</h2>
              </div>
              <Link href="/products" className="text-sm font-semibold text-trust underline">
                All machines
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              {related.map((p) =>
                p ? (
                  <li key={p.slug} className="h-full">
                    <ProductCard product={p} showPouch={false} />
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        ) : null}
      </div>

      <StickyCtaBar message={wa} />
    </main>
  );
}
