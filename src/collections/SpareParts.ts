import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";
import { authenticatedOrPublished } from "@/access/authenticatedOrPublished";
import { revalidateContent } from "@/lib/payload/revalidate";

export const SpareParts: CollectionConfig = {
  slug: "spare-parts",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "sku", "pricePaise", "status"],
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
    { name: "sku", type: "text" },
    { name: "description", type: "textarea" },
    {
      name: "compatibleProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
    },
    { name: "pricePaise", type: "number" },
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
    afterChange: [() => revalidateContent(["spare-parts"])],
    afterDelete: [() => revalidateContent(["spare-parts"])],
  },
  timestamps: true,
};
