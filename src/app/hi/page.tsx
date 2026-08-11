import type { Metadata } from "next";
import Link from "next/link";

import { getApplications, getProducts } from "@/lib/api/catalogue";
import { waLink } from "@/lib/api/client";
import { hi } from "@/lib/hi";
import { hreflangAlternatesForHindi } from "@/lib/seo";

export const metadata: Metadata = {
  title: "YugMach — असली कीमतों वाली पैकिंग मशीनें",
  description:
    "35+ पैकिंग मशीनें नमकीन, मसाला, पाउडर और स्नैक्स के लिए। प्रकाशित कीमतें, मथुरा से डिलीवरी पूरे भारत में।",
  alternates: hreflangAlternatesForHindi("/hi"),
};

export default async function HiHomePage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let apps: Awaited<ReturnType<typeof getApplications>> = [];
  try {
    [products, apps] = await Promise.all([getProducts(), getApplications()]);
  } catch {
    products = [];
    apps = [];
  }
  const featured = (products.filter((p) => p.isFeatured).slice(0, 6) || []).length
    ? products.filter((p) => p.isFeatured).slice(0, 6)
    : products.slice(0, 6);

  return (
    <main className="pb-20" lang="hi">
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-muted">
          मशीनें जो समय पर पहुँचती हैं
        </p>
        <h1 className="font-display max-w-3xl text-4xl font-semibold leading-tight text-ink md:text-5xl">
          आप जो बनाते हैं, उसके लिए सही पैकिंग मशीन।
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-muted">
          नमकीन, मसाला, पाउडर, स्नैक्स और अन्य उत्पादों के लिए 35+ मशीनें — साफ़ प्रकाशित कीमतों के साथ। मथुरा से
          निर्मित, पूरे भारत में डिलीवरी।
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/machine-finder" className="rounded bg-amber px-5 py-3 font-semibold text-amber-ink">
            अपनी मशीन खोजें
          </Link>
          <a
            href={waLink("नमस्ते, मुझे पैकिंग मशीन चाहिए")}
            className="rounded border border-border bg-surface-raised px-5 py-3 font-semibold text-ink"
          >
            {hi.whatsapp} पर बात करें
          </a>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 text-sm text-ink-muted md:grid-cols-4">
          <p>4.9★ · 40 सत्यापित समीक्षाएँ</p>
          <p>35+ मशीन मॉडल</p>
          <p>मथुरा में निर्मित</p>
          <p>GST व UDYAM पंजीकृत</p>
        </div>
      </section>

      <section className="border-t border-border bg-surface-raised py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-2xl font-semibold text-ink">{hi.featured}</h2>
          {featured.length ? (
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <li key={p.slug} className="border border-border bg-surface p-5">
                  <Link href={`/hi/products/${p.slug}`} className="font-display font-semibold text-ink hover:underline">
                    {p.name}
                  </Link>
                  <p className="tabular-price mt-3 text-xl font-semibold text-price">
                    {p.priceDisplay ?? hi.priceOnRequest}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">{hi.gstExtra}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-ink-muted">जल्द ही उपलब्ध।</p>
          )}
          <Link href="/hi/products" className="mt-8 inline-block text-info underline">
            {hi.allProducts} देखें
          </Link>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-2xl font-semibold text-ink">आप क्या पैक करते हैं?</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(apps.slice(0, 6) || []).map((a) => (
              <li key={a.slug} className="border border-border bg-surface-raised p-5">
                <Link href={`/hi/packing-machine/${a.slug}`} className="font-semibold text-ink hover:underline">
                  {a.nameHi || a.name}
                </Link>
                <p className="mt-2 text-sm text-price">
                  {a.priceMinDisplay && a.priceMaxDisplay
                    ? `${a.priceMinDisplay} – ${a.priceMaxDisplay}`
                    : a.priceMinDisplay || hi.priceOnRequest}
                </p>
              </li>
            ))}
          </ul>
          <Link href="/hi/packing-machine" className="mt-8 inline-block text-info underline">
            सभी एप्लिकेशन देखें
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-steel py-14 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl font-semibold">कोटेशन के लिए तैयार हैं?</h2>
          <p className="mt-3 text-white/80">
            व्हाट्सऐप पर तुरंत जवाब पाएं या फ़ॉर्म भरें — हमारी टीम आपके उत्पाद के हिसाब से मशीन सुझाएगी।
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={waLink("नमस्ते, मुझे पैकिंग मशीन का कोटेशन चाहिए")}
              className="rounded bg-whatsapp px-5 py-3 font-semibold text-white"
            >
              {hi.whatsapp}
            </a>
            <Link href="/hi/contact" className="rounded bg-amber px-5 py-3 font-semibold text-amber-ink">
              {hi.getQuote}
            </Link>
            <Link href="/" className="rounded border border-white/30 px-5 py-3 font-semibold text-white">
              English
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
