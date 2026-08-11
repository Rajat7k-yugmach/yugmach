import type { Metadata } from "next";
import Link from "next/link";
import { getApplications } from "@/lib/api/catalogue";
import { hreflangAlternatesForHindi } from "@/lib/seo";
export const metadata: Metadata = {
  title: "एप्लिकेशन",
  description: "आप जो पैक करते हैं उसके अनुसार युगमच पैकिंग मशीनें ब्राउज़ करें — नमकीन, मसाला, पाउडर और अन्य।",
  alternates: hreflangAlternatesForHindi("/hi/packing-machine"),
};
export default async function Page() {
  const apps = await getApplications();
  return (<main className="mx-auto max-w-6xl px-4 py-10" lang="hi"><h1 className="font-display text-3xl font-semibold">एप्लिकेशन के अनुसार मशीनें</h1>
  <ul className="mt-8 grid gap-4 sm:grid-cols-2">{apps.map(a=>(<li key={a.slug} className="border border-border p-4"><Link href={`/hi/packing-machine/${a.slug}`} className="font-semibold hover:underline">{a.nameHi || a.h1}</Link>
  <p className="mt-2 text-sm text-price">{a.priceMinDisplay && a.priceMaxDisplay ? `${a.priceMinDisplay} – ${a.priceMaxDisplay}` : a.priceMinDisplay || "मूल्य अनुरोध पर"}</p></li>))}</ul></main>);
}
