import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";
import { authenticatedOrPublished } from "@/access/authenticatedOrPublished";

async function revalidate(tags: string[]) {
  try {
    const { revalidateContent } = await import("@/lib/payload/revalidate");
    revalidate(tags);
  } catch {
    // ignore outside Next.js
  }
}


export const CaseStudies: CollectionConfig = {
  slug: "case-studies",
  admin: {
    useAsTitle: "customerName",
    defaultColumns: ["customerName", "slug", "industry", "status"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "customerName", type: "text", required: true },
    { name: "customerCity", type: "text" },
    { name: "industry", type: "text" },
    { name: "challenge", type: "textarea", required: true },
    { name: "solution", type: "textarea", required: true },
    { name: "results", type: "textarea", required: true },
    { name: "metrics", type: "json", defaultValue: {} },
    { name: "videoId", type: "text" },
    {
      name: "products",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
    },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
      required: true,
    },
  ],
  hooks: {
    afterChange: [
      ({ doc }) =>
        revalidate(["case-studies", `case-study:${doc.slug}`, "sitemap"]),
    ],
    afterDelete: [() => revalidate(["case-studies", "sitemap"])],
  },
  timestamps: true,
};