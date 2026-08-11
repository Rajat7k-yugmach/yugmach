import { getPayload } from "@/lib/payload/getPayload";
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

const FALLBACK: SiteSettings = {
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

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const payload = await getPayload();
    const settings = await payload.findGlobal({
      slug: "site-settings",
      overrideAccess: true,
    });
    const channels = await payload.find({
      collection: "contact-channels",
      where: { isActive: { equals: true } },
      limit: 50,
      depth: 0,
      sort: "sortOrder",
      overrideAccess: true,
    });

    const mapped: ContactChannel[] = channels.docs.map((c) => ({
      id: String(c.id),
      channelType: c.channelType as "whatsapp" | "phone",
      label: String(c.label),
      e164: String(c.e164),
      display: String(c.display),
      isPrimary: Boolean(c.isPrimary),
      isActive: Boolean(c.isActive),
      sortOrder: Number(c.sortOrder ?? 0),
    }));

    const whatsapp = mapped.filter((c) => c.channelType === "whatsapp");
    const phones = mapped.filter((c) => c.channelType === "phone");

    return {
      businessHours: String(settings.businessHours ?? FALLBACK.businessHours),
      gstin: String(settings.gstin ?? ""),
      showGstin: Boolean(settings.showGstin),
      companyEmail: String(settings.companyEmail ?? FALLBACK.companyEmail),
      companyAddress: String(settings.companyAddress ?? FALLBACK.companyAddress),
      whatsapp: whatsapp.length ? whatsapp : FALLBACK.whatsapp,
      phones: phones.length ? phones : FALLBACK.phones,
    };
  } catch {
    return FALLBACK;
  }
}

export function primaryWhatsApp(settings: SiteSettings): ContactChannel {
  return (
    settings.whatsapp.find((c) => c.isPrimary) ||
    settings.whatsapp[0] ||
    FALLBACK.whatsapp[0]
  );
}

export function primaryPhone(settings: SiteSettings): ContactChannel {
  return (
    settings.phones.find((c) => c.isPrimary) ||
    settings.phones[0] ||
    FALLBACK.phones[0]
  );
}

export function waE164(channel: ContactChannel): string {
  return channel.e164.replace(/\D/g, "");
}

export function telHref(channel: ContactChannel): string {
  const d = channel.e164.replace(/\s/g, "");
  return d.startsWith("+") ? d : `+${d.replace(/\D/g, "")}`;
}
