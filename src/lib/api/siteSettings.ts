import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  PHONE_DISPLAY,
  PHONE_TEL,
  WHATSAPP_DISPLAY,
  WHATSAPP_E164,
} from "@/lib/constants";

export type ContactChannel = {
  id: string;
  channelType: "whatsapp" | "phone";
  label: string;
  e164: string;
  display: string;
  isPrimary: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type SiteSettings = {
  businessHours: string;
  gstin: string;
  showGstin: boolean;
  companyEmail: string;
  companyAddress: string;
  whatsapp: ContactChannel[];
  phones: ContactChannel[];
};

export const SITE_SETTINGS_FALLBACK: SiteSettings = {
  businessHours: "Mon–Sat, 9am–7pm",
  gstin: "",
  showGstin: false,
  companyEmail: COMPANY_EMAIL,
  companyAddress: COMPANY_ADDRESS,
  whatsapp: [
    {
      id: "fallback-wa",
      channelType: "whatsapp",
      label: "Sales",
      e164: WHATSAPP_E164,
      display: WHATSAPP_DISPLAY,
      isPrimary: true,
      isActive: true,
      sortOrder: 0,
    },
  ],
  phones: [
    {
      id: "fallback-phone",
      channelType: "phone",
      label: "Sales",
      e164: PHONE_TEL,
      display: PHONE_DISPLAY,
      isPrimary: true,
      isActive: true,
      sortOrder: 0,
    },
  ],
};

export function primaryWhatsApp(settings: SiteSettings): ContactChannel {
  return (
    settings.whatsapp.find((c) => c.isPrimary) ||
    settings.whatsapp[0] ||
    SITE_SETTINGS_FALLBACK.whatsapp[0]
  );
}

export function primaryPhone(settings: SiteSettings): ContactChannel {
  return (
    settings.phones.find((c) => c.isPrimary) ||
    settings.phones[0] ||
    SITE_SETTINGS_FALLBACK.phones[0]
  );
}

export function waE164(channel: ContactChannel): string {
  return channel.e164.replace(/\D/g, "");
}

export function telHref(channel: ContactChannel): string {
  const d = channel.e164.replace(/\s/g, "");
  return d.startsWith("+") ? d : `+${d.replace(/\D/g, "")}`;
}
