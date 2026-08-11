import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Package, Wrench } from "lucide-react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getSpareParts } from "@/lib/api/catalogue";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Spare parts for packing machines",
  description:
    "Order genuine YugMach spare parts — sealing jaws, collars, load cells, HMI panels. WhatsApp your machine model for availability.",
  path: "/spares",
  withHreflang: false,
});

function categoryFor(name: string, description = "") {
  const t = `${name} ${description}`.toLowerCase();
  if (/jaw|seal|teflon/.test(t)) return "Sealing";
  if (/collar|film|unwind|brake/.test(t)) return "Film & forming";
  if (/weigher|load cell|bucket|auger/.test(t)) return "Filling & weigh";
  if (/hmi|solenoid|photocell|sensor|valve/.test(t)) return "Controls";
  return "Common parts";
}

export default async function SparesPage() {
  const parts = await getSpareParts();
  const groups = new Map<string, typeof parts>();
  for (const p of parts) {
    const cat = categoryFor(p.name, p.description);
    const list = groups.get(cat) || [];
    list.push(p);
    groups.set(cat, list);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-10">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: "Spare parts" }]}
      />

      <section className="mt-4 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="section-label text-amber-text">After-sales</p>
          <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Spare parts that keep your line running
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted">
            Sealing jaws wear. Collars score. Sensors drift. Share your machine
            model and the part you need — we confirm stock and price before
            dispatch.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <WhatsAppButton
              message="Hi, I need spare parts for my packing machine. Model: "
              className="tap-target inline-flex items-center justify-center rounded-lg bg-whatsapp px-5 py-3 text-sm font-bold text-white"
            >
              WhatsApp for spares
            </WhatsAppButton>
            <Link
              href="/service"
              className="tap-target inline-flex items-center gap-1 rounded-lg border border-border bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-surface"
            >
              Service &amp; AMC
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {[
            {
              Icon: Package,
              t: "What to send us",
              d: "Machine model (or photo of nameplate) + part name / symptom.",
            },
            {
              Icon: Wrench,
              t: "How we help",
              d: "Confirm fitment, quote, and courier dispatch India-wide.",
            },
          ].map(({ Icon, t, d }) => (
            <li
              key={t}
              className="rounded-xl border border-border bg-white p-4 shadow-sm"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-amber/12 text-amber-text">
                <Icon className="size-4" aria-hidden />
              </span>
              <p className="mt-3 font-display text-base font-extrabold text-ink">
                {t}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      {parts.length > 0 ? (
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-ink">
                Common spare catalogue
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Indicative prices · GST extra · Confirm fitment for your model
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-10">
            {Array.from(groups.entries()).map(([cat, list]) => (
              <div key={cat}>
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-amber-text">
                  {cat}
                </h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {list.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition hover:border-amber/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {p.sku ? (
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-muted">
                              {p.sku}
                            </p>
                          ) : null}
                          <h4 className="mt-1 font-display text-lg font-extrabold tracking-tight text-ink">
                            {p.name}
                          </h4>
                        </div>
                        <p className="shrink-0 tabular-price text-base font-semibold text-price">
                          {p.priceDisplay ?? "On request"}
                        </p>
                      </div>
                      {p.description ? (
                        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-muted">
                          {p.description}
                        </p>
                      ) : null}
                      <WhatsAppButton
                        message={`Hi, I need spare part: ${p.name}${p.sku ? ` (${p.sku})` : ""}. My machine model is: `}
                        className="mt-4 inline-flex w-fit items-center justify-center rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-ink hover:border-amber hover:text-amber-text"
                      >
                        Request this part
                      </WhatsAppButton>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-12 rounded-2xl border border-dashed border-border bg-surface px-5 py-8 text-center">
          <p className="font-display text-lg font-extrabold text-ink">
            Catalogue updating
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            WhatsApp your machine model and the part or symptom — we will confirm
            availability and price.
          </p>
          <WhatsAppButton
            message="Hi, I need spare parts for my packing machine. Model: "
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-whatsapp px-5 py-3 text-sm font-bold text-white"
          >
            WhatsApp for spares
          </WhatsAppButton>
        </section>
      )}

      <p className="mt-10 text-sm text-ink-muted">
        Need install or AMC instead?{" "}
        <Link href="/service" className="font-semibold text-trust hover:underline">
          See service options
        </Link>
        .
      </p>
    </main>
  );
}
