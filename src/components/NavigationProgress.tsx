"use client";

import NextTopLoader from "nextjs-toploader";

/**
 * Site-wide top progress bar for App Router navigation.
 * Mounted on the public site only (admin bypasses AppShell chrome).
 */
export function NavigationProgress() {
  return (
    <NextTopLoader
      color="#f97316"
      height={3}
      showSpinner={false}
      crawl
      easing="ease"
      speed={200}
      shadow="0 0 10px #f97316,0 0 5px #f97316"
    />
  );
}
