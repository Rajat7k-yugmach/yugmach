import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Machine Finder — Match a Packing Machine",
  description:
    "Answer a few questions about your product, capacity and budget. We match packing machines with published prices in India.",
  path: "/machine-finder",
  withHreflang: false,
});

export default function MachineFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
