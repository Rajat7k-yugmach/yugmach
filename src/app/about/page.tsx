import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { COMPANY_ADDRESS } from "@/lib/constants";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About YugMach — Industrial Packing Machines",
  description:
    "YugMach builds application-specific packing machines with published prices and WhatsApp support. India-wide delivery.",
  path: "/about",
});

const LINKS = [
  {
    href: "/about/factory",
    label: "Factory",
    d: "Where machines are built, tested, and filmed for demos.",
  },
  {
    href: "/about/team",
    label: "Team",
    d: "Small team — sales, service, and workshop under one roof.",
  },
  {
    href: "/case-studies",
    label: "Case studies",
    d: "How buyers use our lines on their floors.",
  },
  {
    href: "/partners/become-a-dealer",
    label: "Become a dealer",
    d: "Territory partnership enquiries.",
  },
  {
    href: "/export",
    label: "Export",
    d: "Destination country, voltage, and documentation.",
  },
  {
    href: "/contact",
    label: "Contact",
    d: "WhatsApp, phone, and workshop address.",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-10">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: "About" }]}
      />
      <div className="mt-4 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="section-label text-amber-text">Company</p>
          <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            About YugMach
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            YugMach (Yug Mach) is a proprietorship founded in 2020 by Saket
            Thenua. We build application-specific packing machines for food,
            spice and FMCG manufacturers — with published prices and people who
            answer on WhatsApp.
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Workshop: {COMPANY_ADDRESS}. GST registered (2024). UDYAM
            registered. Team size ≤10. We do not invent ISO or other
            certifications.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <WhatsAppButton
              message="Hi, I want to know more about YugMach machines"
              className="tap-target inline-flex items-center justify-center rounded-lg bg-whatsapp px-5 py-3 text-sm font-bold text-white"
            >
              Talk on WhatsApp
            </WhatsAppButton>
            <Link
              href="/products"
              className="tap-target inline-flex items-center gap-1 rounded-lg border border-border bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-surface"
            >
              Browse machines
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-text">
            How we sell
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
            <li>Published configuration prices — GST extra</li>
            <li>Demo video with your material before you buy</li>
            <li>India-wide dispatch, install &amp; training</li>
            <li>Spares and AMC after commissioning</li>
          </ul>
        </div>
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group flex h-full flex-col rounded-xl border border-border bg-white p-5 transition hover:border-amber"
            >
              <span className="font-display text-lg font-extrabold text-ink group-hover:underline">
                {l.label}
              </span>
              <span className="mt-1.5 text-sm text-ink-muted">{l.d}</span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-trust">
                Open
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
