"use client";

import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { trackEvent } from "@/lib/analytics";
import { primaryWhatsApp, waE164 } from "@/lib/api/siteSettings";
import { type WaPlacement, whatsappUrl } from "@/lib/whatsapp";

type Props = {
  message: string;
  placement?: WaPlacement;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
};

export function WhatsAppButton({
  message,
  placement = "generic",
  children,
  className,
  "aria-label": ariaLabel,
}: Props) {
  const settings = useSiteSettings();
  const wa = primaryWhatsApp(settings);

  return (
    <a
      href={whatsappUrl(message, waE164(wa))}
      className={className}
      aria-label={ariaLabel ?? "Get Price on WhatsApp"}
      rel="noopener noreferrer"
      target="_blank"
      onClick={() =>
        trackEvent("whatsapp_click", {
          placement,
          pageUrl: typeof window !== "undefined" ? window.location.pathname : "",
        })
      }
    >
      {children}
    </a>
  );
}
