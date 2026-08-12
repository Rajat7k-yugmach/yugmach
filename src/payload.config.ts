import path from "path";
import { fileURLToPath } from "url";

import { vercelPostgresAdapter } from "@payloadcms/db-vercel-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Applications } from "./collections/Applications";
import { BlogCategories } from "./collections/BlogCategories";
import { BlogPosts } from "./collections/BlogPosts";
import { CaseStudies } from "./collections/CaseStudies";
import { ContactChannels } from "./collections/ContactChannels";
import { Faqs } from "./collections/Faqs";
import { FinderSteps } from "./collections/FinderSteps";
import { Industries } from "./collections/Industries";
import { Leads } from "./collections/Leads";
import { Locations } from "./collections/Locations";
import { MachineTypes } from "./collections/MachineTypes";
import { Media } from "./collections/Media";
import { Products } from "./collections/Products";
import { Redirects } from "./collections/Redirects";
import { SpareParts } from "./collections/SpareParts";
import { SpecFields } from "./collections/SpecFields";
import { Testimonials } from "./collections/Testimonials";
import { Users } from "./collections/Users";
import { SiteSettings } from "./globals/SiteSettings";
import {
  resolvePayloadCsrfOrigins,
  resolvePayloadServerURL,
} from "./lib/payload/serverURL";

const blobToken = process.env.BLOB_READ_WRITE_TOKEN || "";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // Must match the browser host for /admin — do NOT prefer www.yugmach.com until DNS is live
  serverURL: resolvePayloadServerURL(),
  csrf: resolvePayloadCsrfOrigins(),
  admin: {
    user: Users.slug,
    // Lock admin to light theme (OS dark mode was making inputs/panels near-black)
    theme: "light",
    meta: {
      titleSuffix: "— YugMach Admin",
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      collections: ["products", "blog-posts"],
      breakpoints: [
        { name: "mobile", label: "Mobile", width: 375, height: 812 },
        { name: "desktop", label: "Desktop", width: 1280, height: 800 },
      ],
    },
    components: {
      views: {
        dashboard: {
          Component: "@/components/admin/DashboardRedirect",
        },
      },
    },
  },
  collections: [
    Users,
    Media,
    MachineTypes,
    Applications,
    Industries,
    SpecFields,
    Products,
    Faqs,
    FinderSteps,
    BlogCategories,
    BlogPosts,
    CaseStudies,
    Testimonials,
    Locations,
    SpareParts,
    Redirects,
    Leads,
    ContactChannels,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString:
        process.env.POSTGRES_URL ||
        process.env.DATABASE_URL ||
        "postgres://localhost:5432/yugmach_payload",
    },
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      // Without a token, leave plugin off so local/dev still works with disk uploads
      enabled: Boolean(blobToken),
      collections: {
        media: {
          prefix: "media",
        },
      },
      // Bypass Vercel’s ~4.5MB serverless body limit for larger machine photos
      clientUploads: true,
      token: blobToken,
    }),
  ],
});
