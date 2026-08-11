import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StickyCtaBar } from "@/components/StickyCtaBar";
import { getProduct, getProducts } from "@/lib/api/catalogue";
import { waLink } from "@/lib/api/client";
import { hi } from "@/lib/hi";
import { hreflangAlternatesForHindi } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

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
  if (!p) return { title: "मशीन" };
  const name = p.nameHi || p.name;
  const title = p.priceDisplay ? `${name} — ${p.priceDisplay}` : name;
  return {
    title: title.slice(0, 60),
    description: (p.descriptionHi || p.shortDescription || p.name).slice(0, 160),
    alternates: hreflangAlternatesForHindi(`/hi/products/${slug}`),
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const hasHi = Boolean(product.nameHi || product.descriptionHi);
  const name = product.nameHi || product.name;
  const description = product.descriptionHi || product.description;
  const waMessage = `नमस्ते, मुझे ${name} चाहिए`;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 pb-28" lang="hi">
      <Link href="/hi/products" className="text-sm underline">
        {hi.allProducts}
      </Link>
      <h1 className="font-display mt-4 text-3xl font-semibold">{name}</h1>
      {!hasHi ? (
        <p className="mt-2 text-sm text-ink-muted" role="note">
          {hi.englishBodyNote}
        </p>
      ) : null}
      <div className="mt-6 border border-border bg-surface-raised p-6">
        <p className="tabular-price text-4xl font-semibold text-price">
          {product.priceDisplay ?? hi.priceOnRequest}
        </p>
        <p className="mt-1 text-sm text-ink-muted">/{product.priceUnit} · {hi.gstExtra}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={waLink(waMessage)} className="rounded bg-whatsapp px-5 py-3 font-semibold text-white">
          {hi.whatsapp}
        </a>
        <Link href="/hi/contact" className="rounded bg-amber px-5 py-3 font-semibold text-amber-ink">
          {hi.getQuote}
        </Link>
      </div>
      {product.specGroups?.length ? (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">विशेष विवरण</h2>
          <table className="mt-4 w-full text-left text-sm">
            <tbody>
              {product.specGroups.flatMap((g) =>
                g.fields.map((f) => (
                  <tr key={f.key} className="border-b border-border">
                    <th className="py-3 pr-4 font-medium">{f.labelHi || f.label}</th>
                    <td className="tabular-price py-3">
                      {f.displayValue}
                      {f.unit ? ` ${f.unit}` : ""}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </section>
      ) : null}
      {description ? (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">विवरण</h2>
          <p className="mt-3 whitespace-pre-wrap text-ink-muted">{description}</p>
        </section>
      ) : null}
      {product.relatedProducts?.length ? (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">संबंधित मशीनें</h2>
          <ul className="mt-4 space-y-2">
            {product.relatedProducts.map((r) => (
              <li key={r.slug}>
                <Link href={`/hi/products/${r.slug}`} className="underline">
                  {r.name}
                </Link>{" "}
                — <span className="text-price">{r.priceDisplay}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <StickyCtaBar message={waMessage} />
    </main>
  );
}
