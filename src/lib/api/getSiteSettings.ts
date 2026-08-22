import "server-only";

import { unstable_cache } from "next/cache";

import { getPayload } from "@/lib/payload/getPayload";
import {
  SITE_SETTINGS_FALLBACK,
  type SiteSettings,
  type ContactChannel,
} from "@/lib/api/siteSettings";

async function loadSiteSettings(): Promise<SiteSettings> {
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
      businessHours: String(settings.businessHours ?? SITE_SETTINGS_FALLBACK.businessHours),
      gstin: String(settings.gstin ?? ""),
      showGstin: Boolean(settings.showGstin),
      companyEmail: String(settings.companyEmail ?? SITE_SETTINGS_FALLBACK.companyEmail),
      companyAddress: String(
        settings.companyAddress ?? SITE_SETTINGS_FALLBACK.companyAddress,
      ),
      whatsapp: whatsapp.length ? whatsapp : SITE_SETTINGS_FALLBACK.whatsapp,
      phones: phones.length ? phones : SITE_SETTINGS_FALLBACK.phones,
    };
  } catch {
    return SITE_SETTINGS_FALLBACK;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return unstable_cache(loadSiteSettings, ["site-settings"], {
    tags: ["site-settings"],
    revalidate: 600,
  })();
}
