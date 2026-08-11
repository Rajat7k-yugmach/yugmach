import type { Metadata } from "next";
import Link from "next/link";
import { getMachineTypes } from "@/lib/api/catalogue";
export const metadata: Metadata = { title: "Machine types", alternates: { canonical: "/machines" } };
export default async function Page() {
  const types = await getMachineTypes();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Machine types</h1>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">{types.map(t=>(
        <li key={t.slug} className="border border-border p-4">
          <Link href={`/machines/${t.slug}`} className="font-semibold hover:underline">{t.name}</Link>
          <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{t.description}</p>
        </li>
      ))}</ul>
    </main>
  );
}
