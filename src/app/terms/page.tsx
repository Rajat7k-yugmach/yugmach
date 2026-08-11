import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/terms" } };
export default function Page() {
  return (<main className="mx-auto max-w-3xl px-4 py-10"><h1 className="font-display text-3xl font-semibold">Terms of Service</h1>
  <p className="mt-4 text-ink-muted">Website content is informational. Machine specifications and prices may change; quotations govern commercial terms. GST extra unless stated.</p>
  <p className="mt-6"><Link href="/contact" className="underline">Contact</Link></p></main>);
}
