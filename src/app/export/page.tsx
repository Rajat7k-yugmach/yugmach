import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeadForm } from "@/components/LeadForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Export packing machines from India",
  description:
    "Export enquiry for YugMach packing machines — share destination country, voltage and product to pack.",
  path: "/export",
  withHreflang: false,
});

export default function ExportPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-10">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: "Export" }]}
      />
      <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="section-label text-amber-text">International</p>
          <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Export packing machines
          </h1>
          <p className="mt-3 text-ink-muted">
            Share destination country, preferred voltage, and the product you
            pack. Documentation is arranged case by case — we do not invent
            certifications.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-ink-muted">
            <li>• Product to pack + pouch size / film if known</li>
            <li>• Destination country &amp; port preference</li>
            <li>• Voltage / frequency (e.g. 220V 50Hz, 380V 60Hz)</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <WhatsAppButton
              message="Hi, I need an export quote for a packing machine. Country: "
              className="tap-target inline-flex items-center justify-center rounded-lg bg-whatsapp px-5 py-3 text-sm font-bold text-white"
            >
              WhatsApp export desk
            </WhatsAppButton>
            <Link
              href="/products"
              className="tap-target inline-flex items-center gap-1 rounded-lg border border-border bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-surface"
            >
              See catalogue
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
          <h2 className="font-display text-lg font-extrabold text-ink">
            Export enquiry
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            We reply on WhatsApp or phone with next steps.
          </p>
          <div className="mt-5">
            <LeadForm
              source="OTHER"
              defaultMessage="Export enquiry — country, voltage, product to pack:"
              submitLabel="Send export enquiry"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
