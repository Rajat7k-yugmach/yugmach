import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";
import { authenticatedOrPublished } from "@/access/authenticatedOrPublished";
import { resolvePayloadServerURL } from "@/lib/payload/serverURL";

async function revalidate(tags: string[]) {
  try {
    const { revalidateContent } = await import("@/lib/payload/revalidate");
    revalidateContent(tags);
  } catch {
    // ignore outside Next.js
  }
}

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "status", "isFeatured", "pricePaise"],
    livePreview: {
      openByDefault: true,
      breakpoints: [
        { name: "mobile", label: "Mobile", width: 375, height: 812 },
        { name: "tablet", label: "Tablet", width: 768, height: 1024 },
        { name: "desktop", label: "Desktop", width: 1280, height: 800 },
      ],
      url: ({ data }) => {
        if (!data?.slug || typeof data.slug !== "string") return null;
        const base = resolvePayloadServerURL() || "";
        // Same-origin iframe sends payload session cookie; page verifies via payload.auth()
        return `${base}/products/${data.slug}?preview=1`;
      },
    },
    preview: (doc) => {
      if (!doc?.slug || typeof doc.slug !== "string") return null;
      const base = resolvePayloadServerURL() || "";
      return `${base}/products/${doc.slug}?preview=1`;
    },
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
    { name: "shortDescription", type: "text" },
    { name: "shortDescriptionHi", type: "text" },
    { name: "description", type: "textarea" },
    { name: "descriptionHi", type: "textarea" },
    { name: "pricePaise", type: "number" },
    { name: "priceUnit", type: "text", defaultValue: "Unit" },
    { name: "priceNote", type: "text" },
    {
      name: "machineType",
      type: "relationship",
      relationTo: "machine-types",
    },
    {
      name: "applications",
      type: "relationship",
      relationTo: "applications",
      hasMany: true,
    },
    {
      name: "industries",
      type: "relationship",
      relationTo: "industries",
      hasMany: true,
    },
    {
      name: "relatedProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
    },
    {
      name: "specs",
      type: "json",
      defaultValue: {},
      admin: {
        description:
          "Machine specs shown on the product page. Prefer the labeled fields below — Spec Fields collection defines labels/units.",
        components: {
          Field: "@/components/admin/ProductSpecsField",
        },
      },
    },
    { name: "features", type: "json", defaultValue: [] },
    { name: "useCases", type: "json", defaultValue: [] },
    {
      name: "images",
      type: "array",
      labels: { singular: "Image", plural: "Images" },
      admin: {
        description:
          "Click Add Image → upload or pick from Media (recommended). If a row shows a grey box forever, clear Media and re-upload. Legacy /machines/... paths still work in Url.",
        components: {
          RowLabel: "@/components/admin/ProductImageRowLabel",
        },
      },
      fields: [
        {
          name: "media",
          type: "upload",
          relationTo: "media",
          admin: {
            description: "Upload a new file or choose existing Media",
          },
        },
        { name: "cloudinaryId", type: "text", admin: { condition: () => false } },
        {
          name: "url",
          type: "text",
          admin: {
            description:
              "Legacy path e.g. /machines/{slug}/primary.jpg — auto-filled when you upload Media",
          },
        },
        { name: "alt", type: "text", required: true },
        { name: "altHi", type: "text" },
        {
          name: "width",
          type: "number",
          admin: { description: "Auto-filled from upload when possible" },
        },
        {
          name: "height",
          type: "number",
          admin: { description: "Auto-filled from upload when possible" },
        },
        { name: "isPrimary", type: "checkbox", defaultValue: false },
        { name: "sortOrder", type: "number", defaultValue: 0 },
      ],
    },
    {
      name: "videos",
      type: "array",
      fields: [
        { name: "provider", type: "text", defaultValue: "youtube" },
        { name: "videoId", type: "text", required: true },
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
        { name: "thumbnailUrl", type: "text" },
        { name: "durationSec", type: "number" },
        { name: "uploadDate", type: "date" },
        { name: "transcript", type: "textarea" },
        { name: "sortOrder", type: "number", defaultValue: 0 },
      ],
    },
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
    { name: "isFeatured", type: "checkbox", defaultValue: false },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    { name: "viewCount", type: "number", defaultValue: 0 },
    { name: "indiamartUrl", type: "text" },
    { name: "legacyId", type: "text", index: true, admin: { position: "sidebar" } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!data?.images || !Array.isArray(data.images)) return data;

        const images = await Promise.all(
          data.images.map(async (row: Record<string, unknown>) => {
            const mediaId =
              typeof row.media === "object" && row.media && "id" in row.media
                ? (row.media as { id: string | number }).id
                : row.media;

            if (!mediaId) return row;

            try {
              const media = await req.payload.findByID({
                collection: "media",
                id: mediaId as string | number,
                depth: 0,
              });
              const next = { ...row };
              if (typeof media?.url === "string" && media.url) {
                const { toBlobPublicUrl } = await import("@/lib/media");
                next.url = toBlobPublicUrl(media.url) || media.url;
              }
              if (typeof media?.width === "number") next.width = media.width;
              if (typeof media?.height === "number") next.height = media.height;
              if (
                (!next.alt || next.alt === "") &&
                typeof media?.alt === "string" &&
                media.alt
              ) {
                next.alt = media.alt;
              }
              if (!next.width) next.width = 1200;
              if (!next.height) next.height = 900;
              return next;
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              const notFound =
                /not found|Not Found|No document/i.test(message) ||
                (typeof err === "object" &&
                  err !== null &&
                  "status" in err &&
                  (err as { status?: number }).status === 404);
              // Only clear truly missing media — keep relation on transient DB errors
              if (notFound) {
                return { ...row, media: null };
              }
              return row;
            }
          }),
        );

        return { ...data, images };
      },
    ],
    afterChange: [
      ({ doc }) =>
        revalidate([`product:${doc.slug}`, "products", "sitemap", "applications"]),
    ],
    afterDelete: [
      ({ doc }) =>
        revalidate([`product:${doc.slug}`, "products", "sitemap", "applications"]),
    ],
  },
  timestamps: true,
};
