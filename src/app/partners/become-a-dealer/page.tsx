import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeadForm } from "@/components/LeadForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Become a YugMach dealer",
  description:
    "Partner with YugMach to sell packing machines in your region — dealer enquiry.",
  path: "/partners/become-a-dealer",
  withHreflang: false,
});

export default function BecomeDealerPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/about", label: "About" },
          { label: "Become a dealer" },
        ]}
      />
      <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="section-label text-amber-text">Partnership</p>
          <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Become a dealer
          </h1>
          <p className="mt-3 text-ink-muted">
            Sell application-specific packing machines with published prices in
            your territory. Tell us your city, coverage area, and experience —
            we review enquiries manually.
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-relaxed text-ink-muted">
            <li>
              <strong className="text-ink">Who fits:</strong> industrial
              machinery dealers, packaging consultants, and regional agents.
            </li>
            <li>
              <strong className="text-ink">What we share:</strong> catalogue,
              published rates, demo support, and after-sales coordination.
            </li>
            <li>
              <strong className="text-ink">Next step:</strong> short call after
              your enquiry — no automatic approvals.
            </li>
          </ul>
          <WhatsAppButton
            message="Hi, I want to become a YugMach dealer. My city/territory is: "
            className="mt-6 tap-target inline-flex items-center justify-center rounded-lg bg-whatsapp px-5 py-3 text-sm font-bold text-white"
          >
            WhatsApp partnership desk
          </WhatsAppButton>
          <p className="mt-4 text-sm text-ink-muted">
            Looking to buy a machine instead?{" "}
            <Link href="/products" className="font-semibold text-trust hover:underline">
              Browse catalogue
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
          <h2 className="font-display text-lg font-extrabold text-ink">
            Dealer enquiry
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            City, territory and experience help us respond faster.
          </p>
          <div className="mt-5">
            <LeadForm
              source="OTHER"
              defaultMessage="Dealer partnership enquiry — city, territory, experience:"
              submitLabel="Submit dealer enquiry"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
