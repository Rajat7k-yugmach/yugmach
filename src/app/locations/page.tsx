import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getLocations } from "@/lib/api/catalogue";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Packing machine service locations in India",
  description:
    "YugMach ships and services packing machines across India — see coverage for your city.",
  path: "/locations",
  withHreflang: false,
});

export default async function LocationsIndexPage() {
  let locations: Awaited<ReturnType<typeof getLocations>> = [];
  try {
    locations = await getLocations();
  } catch {
    locations = [];
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-10">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: "Cities" }]}
      />
      <div className="mt-4 max-w-2xl">
        <p className="section-label text-amber-text">Coverage</p>
        <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
          Service locations across India
        </h1>
        <p className="mt-3 text-ink-muted">
          We ship packing machines India-wide. Installation and service visits
          are scheduled from Mathura; spares go by courier.
        </p>
        <WhatsAppButton
          message="Hi, do you cover my city for packing machine install/service? City: "
          className="mt-5 tap-target inline-flex items-center justify-center rounded-lg bg-whatsapp px-5 py-3 text-sm font-bold text-white"
        >
          Check my city on WhatsApp
        </WhatsAppButton>
      </div>

      {locations.length ? (
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <li key={loc.slug}>
              <Link
                href={`/locations/${loc.slug}`}
                className="group flex h-full flex-col rounded-xl border border-border bg-white p-5 transition hover:border-amber"
              >
                <p className="font-display text-lg font-extrabold text-ink group-hover:underline">
                  {loc.city}
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">{loc.state}</p>
                <p className="mt-3 line-clamp-2 flex-1 text-sm text-ink-muted">
                  {loc.h1}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-trust">
                  Coverage details
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-ink-muted">
          Location pages are being published.{" "}
          <Link href="/contact" className="font-semibold text-trust underline">
            Contact us
          </Link>{" "}
          to check coverage for your city.
        </p>
      )}
    </main>
  );
}
