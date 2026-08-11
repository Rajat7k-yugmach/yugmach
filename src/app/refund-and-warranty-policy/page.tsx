import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Refund and warranty policy",
  description: "YugMach refund, replacement and warranty policy for packing machines.",
  alternates: { canonical: "/refund-and-warranty-policy" },
};

export default function RefundWarrantyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Refund & warranty" }]} />
      <h1 className="font-display text-3xl font-semibold text-ink">Refund and warranty policy</h1>
      <div className="mt-6 space-y-4 text-ink-muted">
        <p>
          Machines are made-to-order / configured to your application. Advance payments are generally
          non-refundable once production or configuration starts, unless otherwise agreed in writing.
        </p>
        <p>
          Warranty covers manufacturing defects for the period stated in your order acknowledgement.
          Consumables, wear parts, film, electrical supply issues, misuse and third-party modifications are
          excluded.
        </p>
        <p>
          Transit damage must be reported with photos within 48 hours of delivery. Service visits outside
          warranty may be chargeable.
        </p>
        <p>For claims, contact sales@yugmach.com or WhatsApp (number in Contact / admin settings) with your invoice number.</p>
      </div>
    </main>
  );
}
