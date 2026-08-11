import type { Metadata } from "next";
import Link from "next/link";

import { getBlogPosts } from "@/lib/api/catalogue";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Buyer guides — packing machine price & selection",
  description:
    "How to choose namkeen, masala and pouch packing machines — price bands, filler types, and buyer FAQs from YugMach.",
  path: "/guides",
  withHreflang: false,
});

export default async function GuidesPage() {
  let posts: Awaited<ReturnType<typeof getBlogPosts>> = [];
  try {
    posts = await getBlogPosts();
  } catch {
    posts = [];
  }
  const guides = posts.filter(
    (p) =>
      p.tags?.includes("buyer-guide") ||
      p.tags?.includes("comparison") ||
      p.tags?.includes("price") ||
      p.slug?.includes("guide") ||
      p.slug?.includes("choose") ||
      p.slug?.includes("vs"),
  );
  const list = guides.length ? guides : posts.slice(0, 12);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="section-label">Guides</p>
      <h1 className="font-display mt-1 text-3xl font-semibold">
        Packing machine buyer guides
      </h1>
      <p className="mt-2 text-ink-muted">
        Plain-English answers for searches like <em>namkeen packing machine price</em>,{" "}
        <em>masala packing karne ki machine</em>, and auger vs cup filler — content IndiaMART
        listings cannot publish.
      </p>
      <ul className="mt-8 space-y-4">
        {list.map((p) => (
          <li key={p.slug} className="card-elevated p-5">
            <Link href={`/blog/${p.slug}`} className="font-display text-lg font-semibold hover:underline">
              {p.title}
            </Link>
            {p.excerpt ? <p className="mt-2 text-sm text-ink-muted">{p.excerpt}</p> : null}
          </li>
        ))}
      </ul>
      {!list.length ? (
        <p className="mt-6 text-ink-muted">Guides are being published — check back soon.</p>
      ) : null}
    </main>
  );
}
