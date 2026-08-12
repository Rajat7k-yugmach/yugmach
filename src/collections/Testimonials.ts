import type { CollectionConfig } from "payload";

import { anyone } from "@/access/anyone";
import { authenticated } from "@/access/authenticated";

async function revalidate(tags: string[]) {
  try {
    const { revalidateContent } = await import("@/lib/payload/revalidate");
    revalidateContent(tags);
  } catch {
    // ignore outside Next.js
  }
}


export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  admin: {
    useAsTitle: "customerName",
    defaultColumns: ["customerName", "city", "rating", "isFeatured"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    { name: "customerName", type: "text", required: true },
    { name: "company", type: "text" },
    { name: "city", type: "text" },
    { name: "rating", type: "number", defaultValue: 5, min: 1, max: 5 },
    { name: "text", type: "textarea", required: true },
    { name: "textHi", type: "textarea" },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
    },
    { name: "source", type: "text", defaultValue: "direct" },
    { name: "sourceUrl", type: "text" },
    { name: "isVerified", type: "checkbox", defaultValue: false },
    { name: "isFeatured", type: "checkbox", defaultValue: false },
  ],
  hooks: {
    afterChange: [() => revalidate(["testimonials"])],
    afterDelete: [() => revalidate(["testimonials"])],
  },
  timestamps: true,
};