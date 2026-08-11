import { getLocation, getLocations } from "./catalogue";

export async function getLocationBySlug(slug: string) {
  return getLocation(slug);
}

export async function getAllLocationSlugs() {
  return (await getLocations()).map((l) => l.slug);
}

export { getLocation, getLocations };
