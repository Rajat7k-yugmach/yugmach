import type { CollectionConfig } from "payload";

import { anyone } from "@/access/anyone";
import { authenticated } from "@/access/authenticated";
import { revalidateContent } from "@/lib/payload/revalidate";

export const Redirects: CollectionConfig = {
  slug: "redirects",
  admin: {
    useAsTitle: "source",
    defaultColumns: ["source", "destination", "isPermanent", "hits"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    { name: "source", type: "text", required: true, unique: true, index: true },
    { name: "destination", type: "text", required: true },
    { name: "isPermanent", type: "checkbox", defaultValue: true },
    { name: "hits", type: "number", defaultValue: 0 },
  ],
  hooks: {
    afterChange: [() => revalidateContent(["seo-redirects"])],
    afterDelete: [() => revalidateContent(["seo-redirects"])],
  },
  timestamps: true,
};
