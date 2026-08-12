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

export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "status", "publishedAt"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "title", type: "text", required: true },
    { name: "titleHi", type: "text" },
    { name: "excerpt", type: "text" },
    { name: "excerptHi", type: "text" },
    { name: "content", type: "textarea", required: true },
    { name: "contentHi", type: "textarea" },
    {
      name: "coverMedia",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Upload or pick a cover image (recommended)",
      },
    },
    {
      name: "coverImage",
      type: "text",
      admin: {
        description:
          "Legacy URL/path — auto-filled from Cover Media. You can also paste a path manually.",
      },
    },
    { name: "coverImageAlt", type: "text" },
    {
      name: "category",
      type: "relationship",
      relationTo: "blog-categories",
    },
    { name: "tags", type: "json", defaultValue: [] },
    { name: "authorName", type: "text", defaultValue: "YugMach" },
    { name: "readingMins", type: "number", defaultValue: 5 },
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
    { name: "publishedAt", type: "date" },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!data) return data;
        const mediaId =
          typeof data.coverMedia === "object" && data.coverMedia && "id" in data.coverMedia
            ? (data.coverMedia as { id: string | number }).id
            : data.coverMedia;

        if (!mediaId) return data;

        try {
          const media = await req.payload.findByID({
            collection: "media",
            id: mediaId as string | number,
            depth: 0,
          });
          const next = { ...data };
          if (typeof media?.url === "string" && media.url) {
            next.coverImage = media.url;
          }
          if (
            (!next.coverImageAlt || next.coverImageAlt === "") &&
            typeof media?.alt === "string" &&
            media.alt
          ) {
            next.coverImageAlt = media.alt;
          }
          return next;
        } catch {
          return data;
        }
      },
    ],
    afterChange: [
      ({ doc }) => revalidate(["blog", `blog:${doc.slug}`, "sitemap"]),
    ],
    afterDelete: [() => revalidate(["blog", "sitemap"])],
  },
  timestamps: true,
};
