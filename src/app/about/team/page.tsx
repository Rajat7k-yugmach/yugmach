import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Team",
  description: "Sales, application and service teams at YugMach — packing machine manufacturer.",
  alternates: { canonical: "/about/team" },
};

export default function TeamPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/about", label: "About" },
          { label: "Team" },
        ]}
      />
      <h1 className="font-display text-3xl font-semibold text-ink">Team</h1>
      <p className="mt-4 text-ink-muted">
        Application engineers help match fill type and capacity. Service coordinates installation and AMC.
        Detailed bios will be published with permission — we do not invent credentials.
      </p>
      <p className="mt-8">
        <Link href="/contact" className="text-info underline">
          Talk to sales
        </Link>
      </p>
    </main>
  );
}
