import { getProduct, getProducts, type ProductDetail, type ProductListItem } from "./catalogue";

export type { ProductDetail, ProductListItem };

export async function getPublishedProducts(): Promise<ProductListItem[]> {
  return getProducts();
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return getProduct(slug);
}

export async function getAllProductSlugs(): Promise<string[]> {
  const products = await getProducts();
  return products.map((p) => p.slug);
}

export { getProduct, getProducts };
