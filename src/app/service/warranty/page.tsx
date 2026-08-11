import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Warranty — YugMach service",
  description: "Standard warranty terms for manufacturing defects. Consumables and misuse excluded.",
  alternates: { canonical: "/service/warranty" },
};

export default function WarrantyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/service", label: "Service" },
          { label: "Warranty" },
        ]}
      />
      <h1 className="font-display text-3xl font-semibold text-ink">Warranty</h1>
      <p className="mt-4 text-lg text-ink-muted">Standard warranty terms for manufacturing defects. Consumables and misuse excluded.</p>
      <p className="mt-4 text-ink-muted">
        Exact inclusions depend on the machine and site readiness. Ask for a written scope before dispatch.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <WhatsAppButton
          message="Hi, I need details about warranty"
          className="rounded bg-whatsapp px-5 py-3 font-semibold text-white"
        >
          WhatsApp service team
        </WhatsAppButton>
        <Link href="/contact" className="rounded bg-amber px-5 py-3 font-semibold text-amber-ink">
          Contact
        </Link>
        <Link href="/service" className="rounded border border-border px-5 py-3 font-medium text-ink">
          All service
        </Link>
      </div>
    </main>
  );
}
