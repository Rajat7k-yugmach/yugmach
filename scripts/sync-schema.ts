import { config } from "dotenv";
config({ path: ".env.local", override: true });

async function main() {
  if (!process.env.PAYLOAD_SECRET) throw new Error("missing PAYLOAD_SECRET");
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    throw new Error("missing POSTGRES_URL");
  }

  const { getPayload } = await import("payload");
  const { default: payloadConfig } = await import("../src/payload.config");
  const payload = await getPayload({ config: payloadConfig });

  const blogs = await payload.find({
    collection: "blog-posts",
    limit: 1,
    overrideAccess: true,
  });
  console.log("blog-posts ok", blogs.totalDocs, blogs.docs[0]?.slug);

  const specs = await payload.find({
    collection: "spec-fields",
    limit: 1,
    overrideAccess: true,
  });
  console.log("spec-fields ok", specs.totalDocs);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
