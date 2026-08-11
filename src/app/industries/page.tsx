import type { Metadata } from "next";
import Link from "next/link";
import { getIndustries } from "@/lib/api/catalogue";
export const metadata: Metadata = { title: "Industries", alternates: { canonical: "/industries" } };
export default async function Page() {
  const items = await getIndustries();
  return (<main className="mx-auto max-w-6xl px-4 py-10"><h1 className="font-display text-3xl font-semibold">Industries</h1>
  <ul className="mt-8 grid gap-4 md:grid-cols-2">{items.map(i=>(<li key={i.slug} className="border border-border p-4"><Link href={`/industries/${i.slug}`} className="font-semibold hover:underline">{i.name}</Link><p className="mt-2 text-sm text-ink-muted">{i.description}</p></li>))}</ul></main>);
}
