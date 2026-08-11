import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getTestimonials } from "@/lib/api/catalogue";
import { INDIAMART_REVIEWS_URL } from "@/lib/constants";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Buyer reviews — YugMach packing machines",
  description:
    "Verified buyer reviews for YugMach packing machines. 4.9★ on IndiaMART.",
  path: "/reviews",
  withHreflang: false,
});

/** Drop templated “Verified IndiaMART review for X Machine” lines that name a specific SKU. */
function isGenericEnough(text: string) {
  const t = text.trim();
  if (!t) return false;
  if (/verified indiamart review/i.test(t) && /packing machine|spice machine/i.test(t)) {
    return false;
  }
  return t.length >= 12;
}

export default async function ReviewsPage() {
  const items = await getTestimonials();
  const shown = items.filter((r) => isGenericEnough(r.text || ""));
  const list = shown.length ? shown : items;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-10">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: "Reviews" }]}
      />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="section-label text-amber-text">Social proof</p>
          <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Buyer reviews
          </h1>
          <p className="mt-3 text-ink-muted">
            What buyers say about machines, service, and support — plus our{" "}
            <a
              className="font-semibold text-trust hover:underline"
              href={INDIAMART_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              4.9★ IndiaMART
            </a>{" "}
            rating.
          </p>
        </div>
        <WhatsAppButton
          message="Hi, I saw your reviews and want to discuss a packing machine"
          className="tap-target inline-flex items-center justify-center rounded-lg bg-whatsapp px-5 py-3 text-sm font-bold text-white"
        >
          Talk on WhatsApp
        </WhatsAppButton>
      </div>

      <ul className="mt-10 grid gap-4 md:grid-cols-2">
        {list.map((r, i) => (
          <li
            key={r.id || `${r.customerName}-${i}`}
            className="rounded-xl border border-border bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-lg font-extrabold text-ink">
                {r.customerName}
                {r.city ? (
                  <span className="ml-1.5 text-sm font-medium text-ink-muted">
                    · {String(r.city).split(",")[0]}
                  </span>
                ) : null}
              </p>
              {r.rating ? (
                <p className="text-sm font-bold text-amber-text">{r.rating}★</p>
              ) : null}
            </div>
            {r.source ? (
              <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-muted">
                {r.source}
              </p>
            ) : null}
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{r.text}</p>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-ink-muted">
        Ready to shortlist?{" "}
        <Link href="/products" className="font-semibold text-trust hover:underline">
          Browse machines
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="font-semibold text-trust hover:underline">
          contact us
        </Link>
        .
      </p>
    </main>
  );
}
