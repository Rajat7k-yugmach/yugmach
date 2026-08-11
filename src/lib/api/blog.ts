import { getBlogPost, getBlogPosts } from "./catalogue";

export async function getBlogPostBySlug(slug: string) {
  return getBlogPost(slug);
}

export async function getAllBlogSlugs() {
  return (await getBlogPosts()).map((p) => p.slug);
}

export { getBlogPost, getBlogPosts };
