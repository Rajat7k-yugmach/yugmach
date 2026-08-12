"use client";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeadForm } from "@/components/LeadForm";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { primaryPhone, telHref } from "@/lib/api/siteSettings";

export function ContactPageClient() {
  const settings = useSiteSettings();
  const phone = primaryPhone(settings);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Contact" }]} />
      <h1 className="font-display text-3xl font-semibold text-ink">Contact</h1>
      <p className="mt-3 text-ink-muted">
        Prefer WhatsApp — we reply with machine options and published prices. Or send the form below.
      </p>

      <div className="mt-8 space-y-4 rounded-lg border border-border bg-surface-raised p-6 text-sm">
        <p>
          <span className="text-ink-muted">Phone: </span>
          <a href={`tel:${telHref(phone)}`} className="font-medium text-ink hover:underline">
            {phone.display}
          </a>
          <span className="text-ink-muted"> · {settings.businessHours}</span>
        </p>
        <p>
          <span className="text-ink-muted">Email: </span>
          <a
            href={`mailto:${settings.companyEmail}`}
            className="font-medium text-ink hover:underline"
          >
            {settings.companyEmail}
          </a>
        </p>
        <p>
          <span className="text-ink-muted">Factory: </span>
          {settings.companyAddress}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <WhatsAppButton
          message="Hi, mujhe packing machine ka price chahiye"
          placement="hero"
          data-testid="contact-whatsapp"
          className="tap-target rounded-md bg-whatsapp px-5 py-3 font-semibold text-white"
        >
          Get Price on WhatsApp
        </WhatsAppButton>
      </div>

      <h2 className="font-display mt-12 text-xl font-semibold text-ink">Enquiry form</h2>
      <div className="mt-4">
        <LeadForm source="WEBSITE_FORM" submitLabel="Send enquiry" />
      </div>
    </main>
  );
}
