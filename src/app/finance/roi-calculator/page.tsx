import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RoiCalculator } from "@/components/RoiCalculator";
import { DISCLAIMER_FINANCE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "ROI calculator for packing machines",
  description:
    "Estimate simple ROI and payback for a packing machine investment. Illustrative only — not financial advice.",
  alternates: { canonical: "/finance/roi-calculator" },
};

export default function RoiCalculatorPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { label: "ROI calculator" },
        ]}
      />
      <h1 className="font-display text-3xl font-semibold text-ink">ROI calculator</h1>
      <p className="mt-3 text-ink-muted">
        Rough cash-flow sketch using your throughput and margin assumptions.
      </p>
      <div className="mt-8">
        <RoiCalculator />
      </div>
      <p className="mt-6 text-xs text-ink-muted">{DISCLAIMER_FINANCE}</p>
    </main>
  );
}
