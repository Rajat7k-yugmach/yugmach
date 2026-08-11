import { getCaseStudies, getCaseStudy } from "./catalogue";

export async function getCaseStudyBySlug(slug: string) {
  return getCaseStudy(slug);
}

export async function getAllCaseStudySlugs() {
  return (await getCaseStudies()).map((c) => c.slug);
}

export { getCaseStudies, getCaseStudy };
