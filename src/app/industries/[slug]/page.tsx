import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIndustries, getIndustry } from "@/lib/api/catalogue";
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() { try { return (await getIndustries()).map(i=>({slug:i.slug})); } catch { return []; } }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const i = await getIndustry(slug);
  if (!i) return { title: "Not found" };
  return { title: i.name, description: i.description.slice(0,160), alternates: { canonical: `/industries/${slug}` } };
}
export default async function Page({ params }: Props) {
  const { slug } = await params; const i = await getIndustry(slug); if (!i) notFound();
  return (<main className="mx-auto max-w-4xl px-4 py-10"><h1 className="font-display text-3xl font-semibold">{i.name}</h1>
  <p className="mt-4 text-ink-muted">{i.description}</p>
  <ul className="mt-8 space-y-2">{i.products.map(p=>(<li key={p.slug} className="flex justify-between border-b border-border py-2"><Link href={`/products/${p.slug}`} className="hover:underline">{p.name}</Link><span className="text-price">{p.priceDisplay}</span></li>))}</ul></main>);
}
