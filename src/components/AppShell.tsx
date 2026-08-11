"use client";

import { usePathname } from "next/navigation";

import { CookieConsent } from "@/components/CookieConsent";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

/**
 * Public chrome (header/footer) for the marketing site.
 * Payload admin at /admin gets a clean full-viewport shell — no YugMach chrome.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    return <div className="min-h-screen bg-white text-slate-900">{children}</div>;
  }

  return (
    <>
      <SiteHeader />
      <div className="flex-1 pb-24 md:pb-0">{children}</div>
      <SiteFooter />
      <CookieConsent />
    </>
  );
}
