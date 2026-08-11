import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";
import { authenticatedOrPublished } from "@/access/authenticatedOrPublished";
import { revalidateContent } from "@/lib/payload/revalidate";

export const Locations: CollectionConfig = {
  slug: "locations",
  admin: {
    useAsTitle: "city",
    defaultColumns: ["city", "state", "slug", "status"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "city", type: "text", required: true },
    { name: "state", type: "text", required: true },
    { name: "h1", type: "text", required: true },
    { name: "body", type: "textarea", required: true },
    { name: "localCluster", type: "text" },
    { name: "serviceEta", type: "text" },
    { name: "installationCount", type: "number", defaultValue: 0 },
    { name: "lat", type: "number" },
    { name: "lng", type: "number" },
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
        revalidateContent(["locations", `location:${doc.slug}`, "sitemap"]),
    ],
    afterDelete: [() => revalidateContent(["locations", "sitemap"])],
  },
  timestamps: true,
};
