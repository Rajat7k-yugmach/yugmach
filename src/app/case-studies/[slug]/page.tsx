import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCaseStudies, getCaseStudy } from "@/lib/api/catalogue";
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() { try { return (await getCaseStudies()).map(c=>({slug:c.slug})); } catch { return []; } }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const c = await getCaseStudy(slug);
  if (!c) return { title: "Case study" };
  return { title: `${c.customerName} — case study`, alternates: { canonical: `/case-studies/${slug}` } };
}
export default async function Page({ params }: Props) {
  const { slug } = await params; const c = await getCaseStudy(slug); if (!c) notFound();
  return (<main className="mx-auto max-w-3xl px-4 py-10"><Link href="/case-studies" className="text-sm underline">Case studies</Link>
  <h1 className="font-display mt-4 text-3xl font-semibold">{c.customerName}</h1>
  <p className="text-ink-muted">{c.customerCity}</p>
  <h2 className="mt-8 font-semibold">Challenge</h2><p className="text-ink-muted">{c.challenge}</p>
  <h2 className="mt-6 font-semibold">Solution</h2><p className="text-ink-muted">{c.solution}</p>
  <h2 className="mt-6 font-semibold">Results</h2><p className="text-ink-muted">{c.results}</p></main>);
}
