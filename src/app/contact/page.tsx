import type { Metadata } from "next";

import { ContactPageClient } from "@/components/ContactPageClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact YugMach — Packing Machine Enquiry",
  description:
    "Talk to YugMach about packing machines — WhatsApp, phone or enquiry form. Real prices, quick replies across India.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactPageClient />;
}
