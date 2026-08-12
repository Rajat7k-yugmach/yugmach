import type { CollectionConfig } from "payload";

import { anyone } from "@/access/anyone";
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


export const MachineTypes: CollectionConfig = {
  slug: "machine-types",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "status", "sortOrder"],
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
    { name: "sortOrder", type: "number", defaultValue: 0 },
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
    afterChange: [() => revalidate(["machine-types", "products", "sitemap"])],
    afterDelete: [() => revalidate(["machine-types", "products", "sitemap"])],
  },
  timestamps: true,
};