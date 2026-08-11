import type { Metadata } from "next";
import Link from "next/link";

import { getSitemapFeed } from "@/lib/api/catalogue";

export const metadata: Metadata = {
  title: "Sitemap",
  alternates: { canonical: "/sitemap" },
};

export default async function HtmlSitemapPage() {
  let urls: Array<{ url: string }> = [];
  try {
    const feed = await getSitemapFeed();
    urls = feed?.urls ?? [{ url: "/" }, { url: "/products" }, { url: "/contact" }];
  } catch {
    urls = [{ url: "/" }, { url: "/products" }, { url: "/contact" }];
  }
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Sitemap</h1>
      <p className="mt-2 text-sm text-ink-muted">
        XML feed: <Link href="/sitemap.xml">/sitemap.xml</Link>
      </p>
      <ul className="mt-6 columns-1 gap-4 text-sm sm:columns-2">
        {urls.map((u) => (
          <li key={u.url} className="break-inside-avoid py-1">
            <Link href={u.url} className="underline">
              {u.url}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
