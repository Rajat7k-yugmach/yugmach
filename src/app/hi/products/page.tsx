import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/ProductCard";
import { getPublishedProducts } from "@/lib/api/products";
import { hi } from "@/lib/hi";
import { hreflangAlternatesForHindi } from "@/lib/seo";

export const metadata: Metadata = {
  title: "पैकिंग मशीन मूल्य सूची",
  description: "युगमच की सभी पैकिंग मशीनें — प्रकाशित कीमतों के साथ।",
  alternates: hreflangAlternatesForHindi("/hi/products"),
};

export default async function HiProductsPage() {
  let products: Awaited<ReturnType<typeof getPublishedProducts>> = [];
  try {
    products = await getPublishedProducts();
  } catch {
    products = [];
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10" lang="hi">
      <h1 className="font-display text-3xl font-semibold text-ink">{hi.allProducts}</h1>
      <p className="mt-2 text-ink-muted">
        {products.length} मॉडल · {hi.gstExtra}
      </p>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.slug}>
            <ProductCard product={p} hrefPrefix="/hi/products" />
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-ink-muted">
        फ़िल्टर के लिए{" "}
        <Link href="/products" className="text-info underline">
          अंग्रेज़ी कैटलॉग
        </Link>{" "}
        देखें।
      </p>
    </main>
  );
}
