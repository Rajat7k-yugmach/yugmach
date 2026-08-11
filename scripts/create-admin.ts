/**
 * Create the first Payload admin user against the current POSTGRES_URL.
 * Usage: PAYLOAD_SECRET=… POSTGRES_URL=… npx tsx scripts/create-admin.ts
 */
import { getPayload } from "payload";
import config from "../src/payload.config";

async function main() {
  const email = process.env.ADMIN_EMAIL || "sales@yugmach.com";
  const password = process.env.ADMIN_PASSWORD || `Ym-${Math.random().toString(36).slice(2, 10)}!A1`;
  const name = process.env.ADMIN_NAME || "YugMach Admin";

  const payload = await getPayload({ config });
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });

  if (existing.docs[0]) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  await payload.create({
    collection: "users",
    data: { email, password, name },
    overrideAccess: true,
  });

  console.log("Admin created");
  console.log(`  email: ${email}`);
  console.log(`  password: ${password}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
