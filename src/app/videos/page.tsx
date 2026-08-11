import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Machine videos",
  description: "Request demo videos for YugMach packing machines — we share application-relevant clips on WhatsApp.",
  alternates: { canonical: "/videos" },
};

export default function VideosPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Videos" }]} />
      <h1 className="font-display text-3xl font-semibold text-ink">Videos</h1>
      <p className="mt-4 text-ink-muted">
        Tell us what you pack and we share relevant running footage. We do not invent staged specs in captions.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <WhatsAppButton
          message="Hi, please share packing machine demo videos for my product"
          className="rounded bg-whatsapp px-5 py-3 font-semibold text-white"
        >
          Request videos on WhatsApp
        </WhatsAppButton>
        <Link href="/products" className="rounded border border-border px-5 py-3 font-medium text-ink">
          Price list
        </Link>
      </div>
    </main>
  );
}
