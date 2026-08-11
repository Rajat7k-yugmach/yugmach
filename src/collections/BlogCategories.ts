import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";

export const BlogCategories: CollectionConfig = {
  slug: "blog-categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "name", type: "text", required: true },
    { name: "nameHi", type: "text" },
  ],
  timestamps: true,
};
