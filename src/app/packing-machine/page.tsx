import type { Metadata } from "next";
import Link from "next/link";

import { MachineImage } from "@/components/MachineImage";
import { getApplications } from "@/lib/api/catalogue";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Packing Machines by Product — Price in India",
  description:
    "Find packing machines by what you pack — namkeen, masala, powder, snacks, coffee and more. Published prices, India-wide delivery.",
  path: "/packing-machine",
});

export default async function ApplicationsIndexPage() {
  const apps = await getApplications();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="section-label">Applications</p>
      <h1 className="font-display mt-2 text-3xl font-semibold md:text-4xl">What are you packing?</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">
        Pick your product — see machines, published prices, and buying guides written for that SKU.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/packing-machine/${a.slug}`}
              className="card-elevated group block overflow-hidden rounded-lg hover:-translate-y-0.5 transition-transform"
            >
              <MachineImage
                image={a.heroImage ? { url: a.heroImage, alt: a.name } : a.products?.[0]?.primaryImage}
                name={a.name}
                capacityHint={a.priceMinDisplay}
                machineType={a.name}
              />
              <div className="p-4">
                <p className="font-semibold group-hover:underline">{a.h1 || a.name}</p>
                <p className="mt-1 tabular-price text-sm font-semibold text-price">
                  {a.priceMinDisplay ? `from ${a.priceMinDisplay}` : "Ask on WhatsApp"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
