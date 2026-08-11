import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeadForm } from "@/components/LeadForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { COMPANY_ADDRESS, COMPANY_EMAIL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/constants";
import { hi } from "@/lib/hi";
import { hreflangAlternatesForHindi } from "@/lib/seo";

export const metadata: Metadata = {
  title: "संपर्क — युगमच",
  description: "मथुरा स्थित युगमच से पैकिंग मशीन के लिए व्हाट्सऐप या फ़ॉर्म से संपर्क करें।",
  alternates: hreflangAlternatesForHindi("/hi/contact"),
};

export default function HiContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10" lang="hi">
      <Breadcrumbs items={[{ href: "/hi", label: hi.home }, { label: hi.contact }]} />
      <h1 className="font-display text-3xl font-semibold text-ink">{hi.contact}</h1>
      <p className="mt-3 text-ink-muted">व्हाट्सऐप पर जल्दी जवाब मिलता है।</p>
      <div className="mt-8 space-y-3 border border-border bg-surface-raised p-6 text-sm">
        <p>
          फ़ोन:{" "}
          <a href={`tel:${PHONE_TEL}`} className="font-medium underline">
            {PHONE_DISPLAY}
          </a>
        </p>
        <p>
          ईमेल:{" "}
          <a href={`mailto:${COMPANY_EMAIL}`} className="font-medium underline">
            {COMPANY_EMAIL}
          </a>
        </p>
        <p>{COMPANY_ADDRESS}</p>
      </div>
      <div className="mt-6">
        <WhatsAppButton
          message="नमस्ते, मुझे पैकिंग मशीन कोटेशन चाहिए"
          className="rounded bg-whatsapp px-5 py-3 font-semibold text-white"
        >
          {hi.whatsapp}
        </WhatsAppButton>
      </div>
      <h2 className="font-display mt-12 text-xl font-semibold text-ink">Enquiry form</h2>
      <p className="mt-2 text-sm text-ink-muted">{hi.englishBodyNote}</p>
      <div className="mt-4">
        <LeadForm source="WEBSITE_FORM" submitLabel={hi.getQuote} />
      </div>
    </main>
  );
}
