import { hasAnalyticsConsent } from "@/components/CookieConsent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function ensureGtag() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id || typeof window === "undefined") return false;
  if (!hasAnalyticsConsent()) return false;
  if (typeof window.gtag === "function") return true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  window.gtag("js", new Date());
  // We send page_view explicitly (incl. SPA route changes) via trackPageview,
  // so disable gtag's automatic initial pageview to avoid double-counting.
  window.gtag("config", id, { send_page_view: false });
  return true;
}

/** Records a page view (initial load + client-side route changes). */
export function trackPageview(path: string) {
  if (typeof window === "undefined") return;
  if (ensureGtag()) {
    window.gtag?.("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  if (ensureGtag()) {
    window.gtag?.("event", name, params ?? {});
  } else if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", name, params ?? {});
  }
}
