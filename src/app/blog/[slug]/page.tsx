import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getBlogPost, getBlogPosts } from "@/lib/api/catalogue";
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() { try { return (await getBlogPosts()).map(p=>({slug:p.slug})); } catch { return []; } }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const p = await getBlogPost(slug);
  if (!p) return { title: "Not found" };
  return { title: p.title.slice(0,60), description: (p.excerpt||"").slice(0,160), alternates: { canonical: `/blog/${slug}` } };
}
export default async function Page({ params }: Props) {
  const { slug } = await params; const p = await getBlogPost(slug); if (!p) notFound();
  return (<main className="mx-auto max-w-3xl px-4 py-10"><JsonLd data={{"@context":"https://schema.org","@type":"Article",headline:p.title}}/><Link href="/blog" className="text-sm underline">Blog</Link>
  <h1 className="font-display mt-4 text-3xl font-semibold">{p.title}</h1>
  <article className="mt-6 whitespace-pre-wrap text-ink-muted">{p.content}</article></main>);
}
