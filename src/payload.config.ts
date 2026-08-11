import path from "path";
import { fileURLToPath } from "url";

import { vercelPostgresAdapter } from "@payloadcms/db-vercel-postgres";
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
import { Products } from "./collections/Products";
import { Redirects } from "./collections/Redirects";
import { SpareParts } from "./collections/SpareParts";
import { SpecFields } from "./collections/SpecFields";
import { Testimonials } from "./collections/Testimonials";
import { Users } from "./collections/Users";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
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
  plugins: [],
});
