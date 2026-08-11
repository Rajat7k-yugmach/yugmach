import { revalidateTag } from "next/cache";

export function revalidateContent(tags: string[]): void {
  for (const tag of tags) {
    try {
      revalidateTag(tag);
    } catch {
      // Outside Next.js request context (e.g. migration scripts) — ignore
    }
  }
}
