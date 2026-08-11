import { revalidateTag } from "next/cache";

export function revalidateContent(tags: string[]): void {
  for (const tag of tags) {
    try {
      // Next.js 16 requires a second argument (profile)
      revalidateTag(tag, "max");
    } catch {
      // Outside Next.js request context (e.g. migration scripts) — ignore
    }
  }
}
