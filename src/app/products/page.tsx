import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/ProductCard";
import { StickyCtaBar } from "@/components/StickyCtaBar";
import { getApplications, getMachineTypes, getProducts } from "@/lib/api/catalogue";
import { buildPageMetadata } from "@/lib/seo";
import { waMessageGeneric } from "@/lib/whatsapp";

export const metadata: Metadata = buildPageMetadata({
  title: "Packing Machines with Published Prices in India",
  description:
    "Browse packing machines with real configuration prices. Namkeen, masala, powder, snacks. GST extra. India-wide delivery.",
  path: "/products",
});

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const application = typeof sp.application === "string" ? sp.application : undefined;
  const machineType = typeof sp.machine_type === "string" ? sp.machine_type : typeof sp.machineType === "string" ? sp.machineType : undefined;

  const params = new URLSearchParams();
  if (application) params.set("application", application);
  if (machineType) params.set("machine_type", machineType);
  const qs = params.toString();

  const [products, apps, types] = await Promise.all([
    getProducts(qs),
    getApplications(),
    getMachineTypes(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 pb-28">
      <p className="section-label">Catalogue</p>
      <h1 className="font-display mt-2 text-3xl font-semibold md:text-4xl">All packing machines</h1>
      <p className="mt-2 text-ink-muted">
        Published configuration prices. GST extra. Final figure follows pouch, film and options.
      </p>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <label className="text-sm">
          Application
          <select name="application" defaultValue={application || ""} className="ml-2 rounded-lg border border-border bg-surface-raised px-3 py-2">
            <option value="">All</option>
            {apps.map((a) => (
              <option key={a.slug} value={a.slug}>{a.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Type
          <select name="machine_type" defaultValue={machineType || ""} className="ml-2 rounded-lg border border-border bg-surface-raised px-3 py-2">
            <option value="">All</option>
            {types.map((t) => (
              <option key={t.slug} value={t.slug}>{t.name}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-amber-ink">
          Filter
        </button>
        {(application || machineType) ? (
          <Link href="/products" className="self-center text-sm underline">Clear</Link>
        ) : null}
      </form>

      <p className="mt-4 font-mono text-xs text-ink-muted">{products.length} machines</p>

      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.slug} className="reveal h-full">
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
      <StickyCtaBar message={waMessageGeneric()} />
    </main>
  );
}
