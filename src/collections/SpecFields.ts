import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";
import { authenticatedOrPublished } from "@/access/authenticatedOrPublished";

async function revalidate(tags: string[]) {
  try {
    const { revalidateContent } = await import("@/lib/payload/revalidate");
    revalidateContent(tags);
  } catch {
    // ignore outside Next.js
  }
}


export const SpecFields: CollectionConfig = {
  slug: "spec-fields",
  admin: {
    useAsTitle: "label",
    defaultColumns: ["key", "label", "group", "isActive"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    { name: "key", type: "text", required: true, unique: true, index: true },
    { name: "label", type: "text", required: true },
    { name: "labelHi", type: "text" },
    {
      name: "dataType",
      type: "select",
      required: true,
      options: [
        { label: "Integer", value: "INT" },
        { label: "Decimal", value: "DECIMAL" },
        { label: "Text", value: "TEXT" },
        { label: "Boolean", value: "BOOL" },
        { label: "Enum", value: "ENUM" },
        { label: "Range", value: "RANGE" },
        { label: "Multi", value: "MULTI" },
      ],
    },
    { name: "enumOptions", type: "json", defaultValue: [] },
    {
      name: "group",
      type: "select",
      required: true,
      options: [
        { label: "Capacity", value: "CAPACITY" },
        { label: "Filling", value: "FILL" },
        { label: "Pouch & Film", value: "POUCH" },
        { label: "Sealing", value: "SEAL" },
        { label: "Power", value: "POWER" },
        { label: "Physical", value: "PHYSICAL" },
        { label: "Controls", value: "CONTROL" },
        { label: "Commercial", value: "COMMERCIAL" },
      ],
    },
    { name: "displayOrder", type: "number", defaultValue: 0 },
    { name: "unit", type: "text" },
    { name: "prefixValue", type: "text" },
    { name: "suffixValue", type: "text" },
    { name: "helpText", type: "text" },
    { name: "showInSummary", type: "checkbox", defaultValue: false },
    { name: "isFilterable", type: "checkbox", defaultValue: false },
    { name: "isComparable", type: "checkbox", defaultValue: true },
    { name: "isRequired", type: "checkbox", defaultValue: false },
    {
      name: "machineTypes",
      type: "relationship",
      relationTo: "machine-types",
      hasMany: true,
    },
    {
      name: "applications",
      type: "relationship",
      relationTo: "applications",
      hasMany: true,
    },
    { name: "sheetColumn", type: "text" },
    { name: "isActive", type: "checkbox", defaultValue: true },
  ],
  hooks: {
    afterChange: [() => revalidate(["spec-fields", "products"])],
    afterDelete: [() => revalidate(["spec-fields", "products"])],
  },
  timestamps: true,
};