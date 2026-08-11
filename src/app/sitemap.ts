import type { MetadataRoute } from "next";

import { getSitemapFeed } from "@/lib/api/catalogue";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const feed = await getSitemapFeed();
    if (!feed?.urls?.length) {
      return [{ url: SITE, lastModified: new Date() }];
    }
    return feed.urls.map((u) => ({
      url: `${SITE}${u.url}`,
      lastModified: u.lastmod ? new Date(u.lastmod) : new Date(),
    }));
  } catch {
    return [{ url: SITE, lastModified: new Date() }];
  }
}
