import type { MetadataRoute } from "next";

import { getSitemapFeed } from "@/lib/api/catalogue";
import { SITE_URL as SITE } from "@/lib/site";

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
