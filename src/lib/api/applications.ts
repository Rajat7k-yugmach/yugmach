import {
  getApplication,
  getApplications,
  type Application,
  type Application as ApplicationDetail,
} from "./catalogue";

export type { Application, ApplicationDetail };
export type ApplicationListItem = Application;

export async function getApplicationBySlug(slug: string) {
  return getApplication(slug);
}

export async function getAllApplicationSlugs() {
  return (await getApplications()).map((a) => a.slug);
}

export { getApplication, getApplications };
