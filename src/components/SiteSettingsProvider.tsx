"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { SiteSettings } from "@/lib/api/siteSettings";
import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  PHONE_DISPLAY,
  PHONE_TEL,
  WHATSAPP_DISPLAY,
  WHATSAPP_E164,
} from "@/lib/constants";

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

const SiteSettingsContext = createContext<SiteSettings>(FALLBACK);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: SiteSettings;
  children: ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext);
}
