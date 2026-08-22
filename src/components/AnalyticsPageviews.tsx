"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackPageview } from "@/lib/analytics";

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const qs = searchParams?.toString();
    trackPageview(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Fires a GA4 page_view on initial load and on every client-side route change.
 * Dormant until NEXT_PUBLIC_GA_ID is set and the visitor accepts analytics
 * (both enforced inside trackPageview -> ensureGtag).
 */
export function AnalyticsPageviews() {
  // useSearchParams must be wrapped in Suspense in the App Router.
  return (
    <Suspense fallback={null}>
      <PageviewTracker />
    </Suspense>
  );
}
