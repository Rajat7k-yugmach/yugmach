import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";

async function revalidate(tags: string[]) {
  try {
    const { revalidateContent } = await import("@/lib/payload/revalidate");
    revalidateContent(tags);
  } catch {
    // ignore outside Next.js
  }
}


export const ContactChannels: CollectionConfig = {
  slug: "contact-channels",
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "channelType", "display", "isPrimary", "isActive"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: "channelType",
      type: "select",
      required: true,
      options: [
        { label: "WhatsApp", value: "whatsapp" },
        { label: "Phone", value: "phone" },
      ],
    },
    { name: "label", type: "text", required: true },
    { name: "e164", type: "text", required: true },
    { name: "display", type: "text", required: true },
    { name: "isPrimary", type: "checkbox", defaultValue: false },
    { name: "isActive", type: "checkbox", defaultValue: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
  ],
  hooks: {
    afterChange: [() => revalidate(["site-settings"])],
    afterDelete: [() => revalidate(["site-settings"])],
  },
  timestamps: true,
};