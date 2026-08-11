import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StickyCtaBar } from "@/components/StickyCtaBar";
import { getApplication, getApplications } from "@/lib/api/catalogue";
import { waLink } from "@/lib/api/client";
import { hi } from "@/lib/hi";
import { hreflangAlternatesForHindi } from "@/lib/seo";

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
  if (!a) return { title: "एप्लिकेशन" };
  const name = a.nameHi || a.name;
  return {
    title: `${name} पैकिंग मशीन`,
    description: (a.introHi || a.intro || `${name} पैकिंग मशीन — प्रकाशित कीमतों के साथ।`).slice(0, 160),
    alternates: hreflangAlternatesForHindi(`/hi/packing-machine/${slug}`),
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const app = await getApplication(slug);
  if (!app) notFound();

  const hasHi = Boolean(app.h1Hi || app.introHi || app.bodyHi);
  const h1 = app.h1Hi || app.h1;
  const intro = app.introHi || app.intro;
  const body = app.bodyHi || app.body;
  const products = app.products ?? [];
  const waMessage = `नमस्ते, मुझे ${app.nameHi || app.name} पैकिंग मशीन चाहिए`;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 pb-28" lang="hi">
      <Link href="/hi/packing-machine" className="text-sm underline">
        {hi.applications}
      </Link>
      <h1 className="font-display mt-4 text-3xl font-semibold">{h1}</h1>
      {!hasHi ? (
        <p className="mt-2 text-sm text-ink-muted" role="note">
          {hi.englishBodyNote}
        </p>
      ) : null}
      {intro ? <p className="mt-4 text-lg text-ink-muted">{intro}</p> : null}
      <p className="mt-4 text-price">
        {app.priceMinDisplay && app.priceMaxDisplay
          ? `${app.priceMinDisplay} – ${app.priceMaxDisplay}`
          : app.priceMinDisplay || hi.priceOnRequest}{" "}
        · {app.productCount} मशीनें
      </p>
      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">कौन सी मशीन चाहिए?</h2>
        <ul className="mt-4 space-y-2">
          {(products ?? []).map((p) => (
            <li key={p.slug} className="flex justify-between border-b border-border py-2">
              <Link href={`/hi/products/${p.slug}`} className="hover:underline">
                {p.name}
              </Link>
              <span className="tabular-price text-price">{p.priceDisplay ?? "—"}</span>
            </li>
          ))}
        </ul>
      </section>
      {body ? <article className="mt-10 whitespace-pre-wrap text-sm text-ink-muted">{body}</article> : null}
      {(app.faqs ?? []).length ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">अक्सर पूछे जाने वाले प्रश्न</h2>
          <dl className="mt-4 space-y-4">
            {(app.faqs ?? []).map((f, i) => (
              <div key={i}>
                <dt className="font-semibold">{f.question}</dt>
                <dd className="mt-1 text-ink-muted">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      <a
        href={waLink(waMessage)}
        className="mt-8 inline-block rounded bg-whatsapp px-5 py-3 font-semibold text-white"
      >
        {hi.whatsapp}
      </a>
      <StickyCtaBar message={waMessage} />
    </main>
  );
}
