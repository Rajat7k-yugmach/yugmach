import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getBlogPosts } from "@/lib/api/catalogue";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Blog & buying guides",
  description:
    "Packing machine buyer guides — price, filler types, namkeen and masala selection tips from YugMach.",
  path: "/blog",
  withHreflang: false,
});

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Blog" }]} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="section-label text-amber-text">Guides</p>
          <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Blog &amp; buying guides
          </h1>
          <p className="mt-3 text-ink-muted">
            Plain answers on price bands, filler choice, and how to pick a line —
            before you buy.
          </p>
        </div>
        <Link
          href="/guides"
          className="text-sm font-bold text-amber-text hover:underline"
        >
          Buyer guides hub →
        </Link>
      </div>

      {posts.length ? (
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-amber-text">
                  {p.readingMins ? `${p.readingMins} min read` : "Guide"}
                </p>
                <h2 className="font-display mt-2 text-xl font-extrabold leading-snug tracking-tight text-ink group-hover:underline">
                  {p.title}
                </h2>
                {p.excerpt ? (
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-muted">
                    {p.excerpt}
                  </p>
                ) : null}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-trust">
                  Read
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-ink-muted">Guides are being published.</p>
      )}
    </main>
  );
}
