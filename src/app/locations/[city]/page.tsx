import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getLocation, getLocations } from "@/lib/api/catalogue";
import { buildPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ city: string }> };

export async function generateStaticParams() {
  try {
    return (await getLocations()).map((l) => ({ city: l.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const loc = await getLocation(city);
  if (!loc) return { title: "Location" };
  return buildPageMetadata({
    title: loc.h1.slice(0, 60),
    description: `${loc.h1}. Packing machine installation and service in ${loc.city}, ${loc.state}. India-wide support.`.slice(
      0,
      160,
    ),
    path: `/locations/${city}`,
    withHreflang: false,
  });
}

export default async function LocationPage({ params }: Props) {
  const { city } = await params;
  const loc = await getLocation(city);
  if (!loc) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p>
          Not found. <Link href="/contact">Contact</Link>
        </p>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/locations", label: "Locations" }, { label: loc.city }]} />
      <h1 className="font-display text-3xl font-semibold">{loc.h1}</h1>
      <p className="mt-2 text-ink-muted">
        {loc.city}, {loc.state} · {loc.service_eta}
      </p>
      <article className="mt-8 whitespace-pre-wrap text-ink-muted">{loc.body}</article>
    </main>
  );
}
