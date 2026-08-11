import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";
import { authenticatedOrPublished } from "@/access/authenticatedOrPublished";
import { revalidateContent } from "@/lib/payload/revalidate";

export const Industries: CollectionConfig = {
  slug: "industries",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "status"],
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
    { name: "description", type: "textarea" },
    { name: "descriptionHi", type: "textarea" },
    { name: "heroImage", type: "text" },
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
        revalidateContent(["industries", `industry:${doc.slug}`, "products", "sitemap"]),
    ],
    afterDelete: [() => revalidateContent(["industries", "products", "sitemap"])],
  },
  timestamps: true,
};
