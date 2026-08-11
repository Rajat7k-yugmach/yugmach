import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CompareMachines } from "@/components/CompareMachines";
import { getProducts } from "@/lib/api/catalogue";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Compare packing machines",
  description:
    "Compare packing machine price, speed and specs side by side — namkeen, masala, powder and more.",
  path: "/compare",
  withHreflang: false,
});

type Props = { searchParams: Promise<{ ids?: string }> };

const CURATED = [
  {
    label: "Namkeen 2400 vs 1000 PPH",
    ids: "2400-pph-namkeen-packing-machine,1000-pph-automatic-namkeen-packing-machine",
  },
  {
    label: "Spice vs powder line",
    ids: "2400-pph-automatic-spice-packing-machine,500-pph-automatic-powder-packing-machine",
  },
  {
    label: "Snack vs flow wrap",
    ids: "500-pph-snack-packing-machine,500-pph-fully-automatic-flow-wrap-packaging-machine",
  },
];

export default async function ComparePage({ searchParams }: Props) {
  const { ids = "" } = await searchParams;
  const initialIds = ids
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const products = await getProducts();
  const withPrice = products.filter((p) => p.priceDisplay || p.primaryImage);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-10">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: "Compare" }]}
      />
      <div className="mt-4 max-w-2xl">
        <p className="section-label text-amber-text">Machines</p>
        <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
          Compare packing machines
        </h1>
        <p className="mt-3 text-ink-muted">
          Not sure between two models? Line them up on price and specs — then
          shortlist what to demo.
        </p>
      </div>

      <div className="mt-8">
        <CompareMachines
          products={withPrice.map((p) => ({
            slug: p.slug,
            name: p.name,
            priceDisplay: p.priceDisplay,
            shortDescription: p.shortDescription,
            specs: (p.specs || {}) as Record<string, unknown>,
            primaryImage: p.primaryImage,
          }))}
          initialIds={initialIds}
          curated={CURATED.filter((c) =>
            c.ids.split(",").every((id) => products.some((p) => p.slug === id)),
          )}
        />
      </div>

      <p className="mt-10 text-sm text-ink-muted">
        Prefer a guided shortlist?{" "}
        <Link href="/machine-finder" className="font-semibold text-trust hover:underline">
          Machine finder
        </Link>{" "}
        or{" "}
        <Link href="/advisor" className="font-semibold text-trust hover:underline">
          advisor
        </Link>
        .
      </p>
    </main>
  );
}
