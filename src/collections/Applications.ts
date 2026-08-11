import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";
import { authenticatedOrPublished } from "@/access/authenticatedOrPublished";
import { revalidateContent } from "@/lib/payload/revalidate";

export const Applications: CollectionConfig = {
  slug: "applications",
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
    { name: "h1", type: "text", required: true },
    { name: "h1Hi", type: "text" },
    { name: "intro", type: "textarea" },
    { name: "introHi", type: "textarea" },
    { name: "body", type: "textarea" },
    { name: "bodyHi", type: "textarea" },
    { name: "productChallenges", type: "textarea" },
    {
      name: "recommendedFillType",
      type: "select",
      options: [
        { label: "Auger", value: "AUGER" },
        { label: "Cup", value: "CUP" },
        { label: "Multi-head Weigher", value: "MULTI_HEAD" },
        { label: "Linear Weigher", value: "LINEAR_WEIGH" },
        { label: "Liquid", value: "LIQUID" },
        { label: "Manual", value: "MANUAL" },
      ],
    },
    { name: "typicalPouchSizes", type: "json", defaultValue: [] },
    { name: "typicalFilmTypes", type: "json", defaultValue: [] },
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
    afterChange: [
      ({ doc }) =>
        revalidateContent([
          "applications",
          `application:${doc.slug}`,
          "products",
          "sitemap",
        ]),
    ],
    afterDelete: [() => revalidateContent(["applications", "products", "sitemap"])],
  },
  timestamps: true,
};
