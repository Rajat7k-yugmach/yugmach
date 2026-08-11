import { getIndustries, getIndustry, type Industry } from "./catalogue";

export type IndustryListItem = Industry;
export type IndustryDetail = Industry;

export async function getIndustryBySlug(slug: string) {
  return getIndustry(slug);
}

export async function getAllIndustrySlugs() {
  return (await getIndustries()).map((i) => i.slug);
}

export { getIndustries, getIndustry };
