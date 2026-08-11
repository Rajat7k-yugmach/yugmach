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


export const FinderSteps: CollectionConfig = {
  slug: "finder-steps",
  admin: {
    useAsTitle: "label",
    defaultColumns: ["key", "label", "sortOrder", "isActive"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    { name: "key", type: "text", required: true, unique: true, index: true },
    { name: "label", type: "text", required: true },
    { name: "labelHi", type: "text" },
    { name: "helpText", type: "text" },
    {
      name: "inputType",
      type: "select",
      defaultValue: "chip",
      options: [
        { label: "Select", value: "select" },
        { label: "Chip", value: "chip" },
        { label: "Number", value: "number" },
      ],
      required: true,
    },
    { name: "options", type: "json", defaultValue: [] },
    { name: "source", type: "text" },
    {
      name: "dependsOn",
      type: "relationship",
      relationTo: "finder-steps",
    },
    { name: "visibleWhen", type: "json", defaultValue: {} },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    { name: "isActive", type: "checkbox", defaultValue: true },
  ],
  hooks: {
    afterChange: [() => revalidate(["finder-steps"])],
    afterDelete: [() => revalidate(["finder-steps"])],
  },
  timestamps: true,
};