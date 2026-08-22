import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Manrope } from "next/font/google";

import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";
import { AppShell } from "@/components/AppShell";
import { NavigationProgress } from "@/components/NavigationProgress";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import { getSiteSettings } from "@/lib/api/getSiteSettings";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "YugMach — Packing machines with published prices in India",
    template: "%s | YugMach",
  },
  description:
    "Buy packing machines for namkeen, masala, powder, snacks and more. Published prices, India-wide delivery. Find your machine by product.",
  metadataBase: new URL(SITE_URL),
  applicationName: "YugMach",
  authors: [{ name: "YugMach" }],
  creator: "YugMach",
  publisher: "YugMach",
  category: "Industrial packing machines",
  keywords: [
    "packing machine",
    "packing machine price India",
    "namkeen packing machine",
    "masala packing machine",
    "powder packing machine",
    "snack packing machine",
    "YugMach",
  ],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "YugMach",
    title: "YugMach — Packing machines with published prices in India",
    description:
      "Buy packing machines for namkeen, masala, powder, snacks and more. Published prices, India-wide delivery.",
  },
  twitter: {
    card: "summary_large_image",
    title: "YugMach — Packing machines with published prices in India",
    description:
      "Buy packing machines for namkeen, masala, powder, snacks and more. Published prices, India-wide delivery.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isPayloadAdmin = (await headers()).get("x-payload-admin") === "1";

  // Payload RootLayout renders its own <html>/<body>; avoid nested documents.
  if (isPayloadAdmin) {
    return children;
  }

  const settings = await getSiteSettings();

  return (
    <html lang="en-IN" className={cn(inter.variable, manrope.variable, "font-sans")}>
      <body className="flex min-h-screen flex-col antialiased">
        <SiteSettingsProvider value={settings}>
          <NavigationProgress />
          <OrganizationJsonLd settings={settings} />
          <AppShell>{children}</AppShell>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
