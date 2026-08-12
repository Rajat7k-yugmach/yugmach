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


export const Faqs: CollectionConfig = {
  slug: "faqs",
  admin: {
    useAsTitle: "question",
    defaultColumns: ["question", "scope", "sortOrder"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    { name: "question", type: "text", required: true },
    { name: "questionHi", type: "text" },
    { name: "answer", type: "textarea", required: true },
    { name: "answerHi", type: "textarea" },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
    },
    {
      name: "application",
      type: "relationship",
      relationTo: "applications",
    },
    {
      name: "scope",
      type: "select",
      defaultValue: "product",
      options: [
        { label: "Product", value: "product" },
        { label: "Application", value: "application" },
        { label: "General", value: "general" },
      ],
    },
    { name: "sortOrder", type: "number", defaultValue: 0 },
  ],
  hooks: {
    afterChange: [() => revalidate(["products", "applications"])],
    afterDelete: [() => revalidate(["products", "applications"])],
  },
  timestamps: true,
};