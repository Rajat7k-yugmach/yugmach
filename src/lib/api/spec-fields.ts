import { getPayload } from "@/lib/payload/getPayload";

export async function getSpecFields() {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "spec-fields",
    where: { isActive: { equals: true } },
    limit: 500,
    depth: 0,
    sort: "displayOrder",
    overrideAccess: true,
  });
  return result.docs;
}
