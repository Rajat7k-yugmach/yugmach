import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";
import { authenticatedOrPublished } from "@/access/authenticatedOrPublished";

async function revalidate(tags: string[]) {
  try {
    const { revalidateContent } = await import("@/lib/payload/revalidate");
    revalidateContent(tags);
  } catch {
    // ignore outside Next.js
  }
}

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "status", "isFeatured", "pricePaise"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "name", type: "text", required: true },
    { name: "nameHi", type: "text" },
    { name: "shortDescription", type: "text" },
    { name: "shortDescriptionHi", type: "text" },
    { name: "description", type: "textarea" },
    { name: "descriptionHi", type: "textarea" },
    { name: "pricePaise", type: "number" },
    { name: "priceUnit", type: "text", defaultValue: "Unit" },
    { name: "priceNote", type: "text" },
    {
      name: "machineType",
      type: "relationship",
      relationTo: "machine-types",
    },
    {
      name: "applications",
      type: "relationship",
      relationTo: "applications",
      hasMany: true,
    },
    {
      name: "industries",
      type: "relationship",
      relationTo: "industries",
      hasMany: true,
    },
    {
      name: "relatedProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
    },
    { name: "specs", type: "json", defaultValue: {} },
    { name: "features", type: "json", defaultValue: [] },
    { name: "useCases", type: "json", defaultValue: [] },
    {
      name: "images",
      type: "array",
      fields: [
        { name: "cloudinaryId", type: "text" },
        { name: "url", type: "text", required: true },
        { name: "alt", type: "text", required: true },
        { name: "altHi", type: "text" },
        { name: "width", type: "number", required: true },
        { name: "height", type: "number", required: true },
        { name: "isPrimary", type: "checkbox", defaultValue: false },
        { name: "sortOrder", type: "number", defaultValue: 0 },
      ],
    },
    {
      name: "videos",
      type: "array",
      fields: [
        { name: "provider", type: "text", defaultValue: "youtube" },
        { name: "videoId", type: "text", required: true },
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
        { name: "thumbnailUrl", type: "text" },
        { name: "durationSec", type: "number" },
        { name: "uploadDate", type: "date" },
        { name: "transcript", type: "textarea" },
        { name: "sortOrder", type: "number", defaultValue: 0 },
      ],
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
    { name: "isFeatured", type: "checkbox", defaultValue: false },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    { name: "viewCount", type: "number", defaultValue: 0 },
    { name: "indiamartUrl", type: "text" },
    { name: "legacyId", type: "text", index: true, admin: { position: "sidebar" } },
  ],
  hooks: {
    afterChange: [
      ({ doc }) =>
        revalidate([`product:${doc.slug}`, "products", "sitemap", "applications"]),
    ],
    afterDelete: [
      ({ doc }) =>
        revalidate([`product:${doc.slug}`, "products", "sitemap", "applications"]),
    ],
  },
  timestamps: true,
};
