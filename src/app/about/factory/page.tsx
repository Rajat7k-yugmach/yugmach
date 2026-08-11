import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { COMPANY_ADDRESS, PHONE_DISPLAY, PHONE_TEL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Factory & workshop",
  description: "YugMach packing machine factory and workshop. Machines built and configured before India-wide dispatch.",
  alternates: { canonical: "/about/factory" },
};

export default function FactoryPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/about", label: "About" },
          { label: "Factory" },
        ]}
      />
      <h1 className="font-display text-3xl font-semibold text-ink">Factory</h1>
      <p className="mt-4 text-lg text-ink-muted">
        Machines are built and configured in our workshop before dispatch across India.
      </p>
      <p className="mt-4 text-ink-muted">{COMPANY_ADDRESS}</p>
      <p className="mt-2 text-ink-muted">
        Phone:{" "}
        <a href={`tel:${PHONE_TEL}`} className="text-ink underline">
          {PHONE_DISPLAY}
        </a>
      </p>
      <p className="mt-8">
        <Link href="/contact" className="rounded bg-amber px-5 py-3 text-sm font-semibold text-amber-ink">
          Plan a visit / call
        </Link>
      </p>
    </main>
  );
}
