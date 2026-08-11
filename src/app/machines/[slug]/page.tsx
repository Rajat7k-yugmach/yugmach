import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMachineType, getMachineTypes } from "@/lib/api/catalogue";
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() {
  try { return (await getMachineTypes()).map(t => ({ slug: t.slug })); } catch { return []; }
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const t = await getMachineType(slug);
  if (!t) return { title: "Not found" };
  return { title: t.name, description: t.description.slice(0,160), alternates: { canonical: `/machines/${slug}` } };
}
export default async function Page({ params }: Props) {
  const { slug } = await params; const t = await getMachineType(slug); if (!t) notFound();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 pb-24">
      <h1 className="font-display text-3xl font-semibold">{t.name}</h1>
      <p className="mt-4 whitespace-pre-wrap text-ink-muted">{t.description}</p>
      <h2 className="font-display mt-10 text-xl font-semibold">YugMach models</h2>
      <ul className="mt-4 space-y-2">{t.products.map(p=>(
        <li key={p.slug} className="flex justify-between border-b border-border py-2">
          <Link href={`/products/${p.slug}`} className="hover:underline">{p.name}</Link>
          <span className="text-price">{p.priceDisplay}</span>
        </li>
      ))}</ul>
    </main>
  );
}
