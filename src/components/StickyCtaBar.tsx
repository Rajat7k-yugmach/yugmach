"use client";

import Link from "next/link";

import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { primaryPhone, telHref } from "@/lib/api/siteSettings";

type Props = {
  message?: string;
  whatsappMessage?: string;
};

/** Mobile sticky CTA — Price (WA) / Call / Visit Factory */
export function StickyCtaBar({ message, whatsappMessage }: Props) {
  const wa = whatsappMessage || message || "Hi, mujhe packing machine ka price chahiye.";
  const settings = useSiteSettings();
  const phone = primaryPhone(settings);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-raised/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2 px-3 py-2">
        <WhatsAppButton
          message={wa}
          placement="sticky"
          className="tap-target flex items-center justify-center rounded-md bg-whatsapp px-2 text-center text-sm font-semibold text-white"
        >
          Price
        </WhatsAppButton>
        <a
          href={`tel:${telHref(phone)}`}
          className="tap-target flex items-center justify-center rounded-md border border-border px-2 text-center text-sm font-semibold text-ink"
          aria-label={`Call ${phone.display}`}
        >
          Call
        </a>
        <Link
          href="/about/factory"
          className="tap-target flex items-center justify-center rounded-md bg-amber px-2 text-center text-sm font-semibold text-amber-ink"
        >
          Visit
        </Link>
      </div>
    </div>
  );
}
