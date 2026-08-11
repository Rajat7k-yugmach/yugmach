import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Get Packing Machine Price Quote",
  description:
    "Request a packing machine quote from YugMach. Tell us product, speed and city — we reply with published configuration options.",
  path: "/quote",
  withHreflang: false,
});

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
