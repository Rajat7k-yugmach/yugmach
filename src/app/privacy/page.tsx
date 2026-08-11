import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };
export default function Page() {
  return (<main className="mx-auto max-w-3xl px-4 py-10"><h1 className="font-display text-3xl font-semibold">Privacy Policy</h1>
  <p className="mt-4 text-ink-muted">We collect enquiry data (name, phone, city, message) to respond to quotes. Contact sales@yugmach.com for data deletion requests under applicable Indian law (DPDP). Analytics may use cookies — you can refuse non-essential cookies.</p>
  <p className="mt-6"><Link href="/contact" className="underline">Contact</Link></p></main>);
}
