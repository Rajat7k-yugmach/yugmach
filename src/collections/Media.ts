import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "alt",
    defaultColumns: ["filename", "alt", "mimeType", "updatedAt"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    // Public site needs to resolve image URLs / sizes
    read: () => true,
    update: authenticated,
  },
  upload: {
    mimeTypes: ["image/*"],
    imageSizes: [
      {
        name: "card",
        width: 640,
        height: 480,
        position: "centre",
      },
      {
        name: "gallery",
        width: 1200,
        height: 900,
        position: "centre",
      },
    ],
    adminThumbnail: "card",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description: "Short description for SEO and accessibility",
      },
    },
  ],
};
