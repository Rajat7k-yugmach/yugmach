import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.yugmach.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/django-admin", "/api"],
    },
    sitemap: `${site}/sitemap.xml`,
  };
}
