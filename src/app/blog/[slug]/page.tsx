import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MarkdownContent } from "@/components/MarkdownContent";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getBlogPost, getBlogPosts } from "@/lib/api/catalogue";
import { toPublicImageSrc } from "@/lib/media";
import { buildPageMetadata } from "@/lib/seo";
import { displayTitle } from "@/lib/typography";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    return (await getBlogPosts()).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getBlogPost(slug);
  if (!p) return { title: "Not found" };
  const title = displayTitle(p.title).slice(0, 60);
  return buildPageMetadata({
    title,
    description: (p.excerpt || "").slice(0, 160),
    path: `/blog/${slug}`,
    image: toPublicImageSrc(p.coverImage) || "/brand-logo.png",
  });
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const p = await getBlogPost(slug);
  if (!p) notFound();

  const title = displayTitle(p.title);
  const coverSrc = toPublicImageSrc(p.coverImage);
  const published = formatDate(p.publishedAt);
  const related = (await getBlogPosts())
    .filter((x) => x.slug !== slug)
    .slice(0, 2);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: p.excerpt || undefined,
          image: coverSrc || undefined,
          author: { "@type": "Organization", name: p.authorName },
          datePublished: p.publishedAt || undefined,
        }}
      />

      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/blog", label: "Blog" },
          { label: title },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="section-label text-amber-text">Guide</p>
        <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
          {title}
        </h1>
        {p.excerpt ? (
          <p className="mt-3 text-base leading-relaxed text-ink-muted md:text-lg">
            {p.excerpt}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
          {p.readingMins ? <span>{p.readingMins} min read</span> : null}
          {published ? (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={p.publishedAt || undefined}>{published}</time>
            </>
          ) : null}
          {p.authorName ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{p.authorName}</span>
            </>
          ) : null}
        </div>
      </header>

      {coverSrc ? (
        <div className="relative mt-8 aspect-[21/9] max-w-4xl overflow-hidden rounded-xl border border-border bg-surface-sunken">
          <Image
            src={coverSrc}
            alt={p.coverImageAlt || title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 896px"
            priority
          />
        </div>
      ) : null}

      <article className="mt-8 max-w-3xl rounded-xl border border-border bg-white p-6 shadow-sm md:p-8">
        <MarkdownContent>{p.content}</MarkdownContent>
      </article>

      <div className="mt-10 max-w-3xl rounded-2xl border border-border bg-amber-wash px-5 py-6 md:px-8">
        <p className="font-display text-lg font-extrabold text-ink">
          Need a machine for your product?
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Share what you pack — we will suggest a filler and send a published price band.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <WhatsAppButton
            message={`Hi, I read your guide "${title}" and want help choosing a packing machine`}
            className="tap-target inline-flex items-center justify-center rounded-lg bg-whatsapp px-5 py-3 text-sm font-bold text-white"
          >
            Talk on WhatsApp
          </WhatsAppButton>
          <Link
            href="/products"
            className="tap-target inline-flex items-center gap-1 rounded-lg border border-border bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-surface"
          >
            Browse machines
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      {related.length ? (
        <section className="mt-14">
          <p className="section-label text-amber-text">More guides</p>
          <h2 className="font-display mt-1 text-2xl font-extrabold tracking-tight text-ink">
            Keep reading
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/blog/${r.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
                >
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-amber-text">
                    {r.readingMins ? `${r.readingMins} min read` : "Guide"}
                  </p>
                  <h3 className="font-display mt-2 text-lg font-extrabold leading-snug tracking-tight text-ink group-hover:underline">
                    {displayTitle(r.title)}
                  </h3>
                  {r.excerpt ? (
                    <p className="mt-2 line-clamp-2 flex-1 text-sm text-ink-muted">
                      {r.excerpt}
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
        </section>
      ) : null}
    </main>
  );
}
