import type { CollectionConfig } from "payload";

import { anyone } from "@/access/anyone";
import { authenticated } from "@/access/authenticated";

async function revalidate(tags: string[]) {
  try {
    const { revalidateContent } = await import("@/lib/payload/revalidate");
    revalidate(tags);
  } catch {
    // ignore outside Next.js
  }
}


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
    afterChange: [() => revalidate(["seo-redirects"])],
    afterDelete: [() => revalidate(["seo-redirects"])],
  },
  timestamps: true,
};