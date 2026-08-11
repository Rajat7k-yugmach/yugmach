import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getPublishedProducts } from "@/lib/api/products";

export const metadata: Metadata = {
  title: "Machine gallery",
  description: "Browse YugMach packing machines — published models with real prices.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  let products: Awaited<ReturnType<typeof getPublishedProducts>> = [];
  try {
    products = await getPublishedProducts();
  } catch {
    products = [];
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Gallery" }]} />
      <h1 className="font-display text-3xl font-semibold text-ink">Gallery</h1>
      <p className="mt-2 text-ink-muted">
        Product photography and line videos are expanding. Meanwhile, every published model is listed with price.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.slug} className="border border-border bg-surface-raised p-4">
            <Link href={`/products/${p.slug}`} className="font-medium text-ink hover:underline">
              {p.name}
            </Link>
            <p className="tabular-price mt-2 text-price">{p.priceDisplay ?? "On request"}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm">
        <Link href="/videos" className="text-info underline">
          Videos
        </Link>
      </p>
    </main>
  );
}
