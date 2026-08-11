import type { Where } from "payload";

import { getPayload } from "@/lib/payload/getPayload";

export type TaxonomyRef = string | { slug: string; name: string };

export type ProductImage = {
  id?: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  isPrimary?: boolean;
  sortOrder?: number;
};

export type ProductListItem = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  pricePaise: number | null;
  priceDisplay: string | null;
  priceUnit: string;
  specs: Record<string, unknown>;
  status: string;
  isFeatured: boolean;
  machineType?: TaxonomyRef | null;
  applications?: TaxonomyRef[];
  industries?: TaxonomyRef[];
  primaryImage?: ProductImage | null;
  images?: ProductImage[];
};

export type ProductDetail = ProductListItem & {
  nameHi?: string;
  description: string;
  descriptionHi?: string;
  priceNote: string;
  features: string[];
  useCases: string[];
  specGroups: Array<{
    group: string;
    label: string;
    fields: Array<{
      key: string;
      label: string;
      labelHi?: string;
      displayValue: string;
      unit: string;
      showInSummary: boolean;
      value: unknown;
    }>;
  }>;
  faqs?: Array<{ question: string; answer: string }>;
  relatedProducts?: Array<{ slug: string; name: string; priceDisplay: string | null }>;
  primaryApplication?: TaxonomyRef | null;
};

export type Application = {
  id?: string;
  slug: string;
  name: string;
  nameHi?: string;
  h1: string;
  h1Hi?: string;
  intro: string;
  introHi?: string;
  body: string;
  bodyHi?: string;
  productChallenges: string;
  recommendedFillType?: string;
  priceMinDisplay: string | null;
  priceMaxDisplay: string | null;
  priceMinPaise?: number | null;
  priceMaxPaise?: number | null;
  priceRangePaise?: { min_price: number | null; max_price: number | null };
  productCount: number;
  products?: ProductListItem[];
  faqs?: Array<{ question: string; answer: string }>;
  typicalPouchSizes: string[];
  typicalFilmTypes: string[];
  relatedApplications?: Application[];
  heroImage?: string;
  status?: string;
};

export type MachineType = {
  id?: string;
  slug: string;
  name: string;
  nameHi?: string;
  description: string;
  descriptionHi?: string;
  products: ProductListItem[];
  priceRangePaise?: { min_price: number | null; max_price: number | null };
  priceMinDisplay?: string | null;
  priceMaxDisplay?: string | null;
  productCount?: number;
  faqs?: Array<{ question: string; answer: string }>;
  status?: string;
};

export type Industry = {
  id?: string;
  slug: string;
  name: string;
  nameHi?: string;
  description: string;
  descriptionHi?: string;
  products: ProductListItem[];
  status?: string;
  heroImage?: string;
  faqs?: Array<{ question: string; answer: string }>;
};

function formatInr(paise: number | null | undefined): string | null {
  if (paise == null) return null;
  const rupees = Math.floor(paise / 100);
  const s = String(Math.abs(rupees));
  if (s.length <= 3) return `₹${s}`;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const parts: string[] = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) parts.unshift(rest);
  return `₹${parts.join(",")},${last3}`;
}

function relSlug(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "slug" in value) {
    return String((value as { slug: string }).slug);
  }
  return null;
}

function relRef(value: unknown): TaxonomyRef | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "slug" in value) {
    const v = value as { slug: string; name?: string };
    return { slug: v.slug, name: v.name ?? v.slug };
  }
  return null;
}

function mapImages(images: unknown): ProductImage[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((img, idx) => {
      const i = img as Record<string, unknown>;
      return {
        id: typeof i.id === "string" ? i.id : undefined,
        url: String(i.url ?? ""),
        alt: String(i.alt ?? ""),
        width: Number(i.width ?? 0) || undefined,
        height: Number(i.height ?? 0) || undefined,
        isPrimary: Boolean(i.isPrimary),
        sortOrder: Number(i.sortOrder ?? idx),
      };
    })
    .filter((i) => i.url);
}

function mapProductListItem(doc: Record<string, unknown>): ProductListItem {
  const images = mapImages(doc.images);
  const primaryImage =
    images.find((i) => i.isPrimary) ?? images[0] ?? null;
  const machineType = relRef(doc.machineType);
  const applications = Array.isArray(doc.applications)
    ? (doc.applications.map(relRef).filter(Boolean) as TaxonomyRef[])
    : [];
  const industries = Array.isArray(doc.industries)
    ? (doc.industries.map(relRef).filter(Boolean) as TaxonomyRef[])
    : [];
  const pricePaise =
    typeof doc.pricePaise === "number" ? doc.pricePaise : null;

  return {
    id: String(doc.id),
    slug: String(doc.slug),
    name: String(doc.name),
    shortDescription: String(doc.shortDescription ?? ""),
    pricePaise,
    priceDisplay: formatInr(pricePaise),
    priceUnit: String(doc.priceUnit ?? "Unit"),
    specs: (doc.specs as Record<string, unknown>) ?? {},
    status: String(doc.status ?? "draft"),
    isFeatured: Boolean(doc.isFeatured),
    machineType,
    applications,
    industries,
    primaryImage,
    images,
  };
}

async function buildSpecGroups(
  specs: Record<string, unknown>,
): Promise<ProductDetail["specGroups"]> {
  const payload = await getPayload();
  const fields = await payload.find({
    collection: "spec-fields",
    where: { isActive: { equals: true } },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });

  const groupLabels: Record<string, string> = {
    CAPACITY: "Capacity & Output",
    FILL: "Filling",
    POUCH: "Pouch & Film",
    SEAL: "Sealing",
    POWER: "Power & Utilities",
    PHYSICAL: "Physical",
    CONTROL: "Controls",
    COMMERCIAL: "Commercial & Warranty",
    capacity: "Capacity",
    filling: "Filling",
    packaging: "Packaging",
    electrical: "Electrical",
    physical: "Physical",
    other: "Other",
  };

  const byGroup = new Map<string, ProductDetail["specGroups"][number]["fields"]>();

  for (const field of fields.docs) {
    const key = String(field.key);
    if (!(key in specs)) continue;
    const value = specs[key];
    const group = String(field.group ?? "other");
    const unit = String(field.unit ?? "");
    const prefix = String(field.prefixValue ?? "");
    const suffix = String(field.suffixValue ?? "");
    const displayValue = `${prefix}${value ?? ""}${suffix || (unit ? ` ${unit}` : "")}`.trim();
    const list = byGroup.get(group) ?? [];
    list.push({
      key,
      label: String(field.label),
      labelHi: field.labelHi ? String(field.labelHi) : undefined,
      displayValue,
      unit,
      showInSummary: Boolean(field.showInSummary),
      value,
    });
    byGroup.set(group, list);
  }

  return Array.from(byGroup.entries()).map(([group, fields]) => ({
    group,
    label: groupLabels[group] ?? group,
    fields,
  }));
}

function enrichApplication(
  app: Partial<Application> & { slug: string; name: string },
): Application {
  const minPaise = app.priceMinPaise ?? app.priceRangePaise?.min_price ?? null;
  const maxPaise = app.priceMaxPaise ?? app.priceRangePaise?.max_price ?? null;
  return {
    slug: app.slug,
    name: app.name,
    nameHi: app.nameHi ?? "",
    h1: app.h1 || `${app.name} Packing Machine`,
    h1Hi: app.h1Hi ?? "",
    intro: app.intro ?? "",
    introHi: app.introHi ?? "",
    body: app.body ?? "",
    bodyHi: app.bodyHi ?? "",
    productChallenges: app.productChallenges ?? "",
    recommendedFillType: app.recommendedFillType,
    priceMinPaise: minPaise,
    priceMaxPaise: maxPaise,
    priceRangePaise: app.priceRangePaise,
    priceMinDisplay: app.priceMinDisplay ?? formatInr(minPaise),
    priceMaxDisplay: app.priceMaxDisplay ?? formatInr(maxPaise),
    productCount: app.productCount ?? app.products?.length ?? 0,
    products: app.products ?? [],
    faqs: app.faqs ?? [],
    typicalPouchSizes: app.typicalPouchSizes ?? [],
    typicalFilmTypes: app.typicalFilmTypes ?? [],
    relatedApplications: app.relatedApplications,
    heroImage: app.heroImage,
    status: app.status,
    id: app.id,
  };
}

function parseProductQuery(query: string): Where {
  const params = new URLSearchParams(query);
  const and: Where[] = [{ status: { equals: "published" } }];
  const application = params.get("application");
  const machineType = params.get("machine_type") ?? params.get("machineType");
  const industry = params.get("industry");
  const featured = params.get("is_featured") ?? params.get("isFeatured");
  const slug = params.get("slug");

  if (slug) and.push({ slug: { equals: slug } });
  if (featured === "true" || featured === "1") and.push({ isFeatured: { equals: true } });
  if (application) {
    and.push({ "applications.slug": { equals: application } });
  }
  if (machineType) {
    and.push({ "machineType.slug": { equals: machineType } });
  }
  if (industry) {
    and.push({ "industries.slug": { equals: industry } });
  }

  return { and };
}

export async function getProducts(query = ""): Promise<ProductListItem[]> {
  const payload = await getPayload();
  const where = query
    ? parseProductQuery(query)
    : ({ status: { equals: "published" } } as Where);

  const result = await payload.find({
    collection: "products",
    where,
    limit: 200,
    depth: 1,
    sort: "sortOrder",
    overrideAccess: true,
  });

  return result.docs.map((doc) => mapProductListItem(doc as unknown as Record<string, unknown>));
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "products",
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: "published" } }],
    },
    limit: 1,
    depth: 2,
    overrideAccess: true,
  });
  const doc = result.docs[0] as unknown as Record<string, unknown> | undefined;
  if (!doc) return null;

  const base = mapProductListItem(doc);
  const specs = (doc.specs as Record<string, unknown>) ?? {};
  const specGroups = await buildSpecGroups(specs);

  const faqsResult = await payload.find({
    collection: "faqs",
    where: { "product.slug": { equals: slug } },
    limit: 50,
    depth: 0,
    sort: "sortOrder",
    overrideAccess: true,
  });

  const related = Array.isArray(doc.relatedProducts)
    ? doc.relatedProducts
        .map((p) => {
          if (!p || typeof p !== "object") return null;
          const r = p as Record<string, unknown>;
          const pricePaise = typeof r.pricePaise === "number" ? r.pricePaise : null;
          return {
            slug: String(r.slug),
            name: String(r.name),
            priceDisplay: formatInr(pricePaise),
          };
        })
        .filter(Boolean)
    : [];

  const apps = Array.isArray(doc.applications) ? doc.applications : [];
  const primaryApplication = apps.length ? relRef(apps[0]) : null;

  return {
    ...base,
    nameHi: doc.nameHi ? String(doc.nameHi) : undefined,
    description: String(doc.description ?? ""),
    descriptionHi: doc.descriptionHi ? String(doc.descriptionHi) : undefined,
    priceNote: String(doc.priceNote ?? ""),
    features: Array.isArray(doc.features) ? (doc.features as string[]) : [],
    useCases: Array.isArray(doc.useCases) ? (doc.useCases as string[]) : [],
    specGroups,
    faqs: faqsResult.docs.map((f) => ({
      question: String(f.question),
      answer: String(f.answer),
    })),
    relatedProducts: related as ProductDetail["relatedProducts"],
    primaryApplication,
  };
}

export async function getApplications(): Promise<Application[]> {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "applications",
    where: { status: { equals: "published" } },
    limit: 100,
    depth: 0,
    sort: "sortOrder",
    overrideAccess: true,
  });

  const products = await getProducts();
  return result.docs.map((doc) => {
    const slug = String(doc.slug);
    const related = products.filter((p) =>
      (p.applications ?? []).some((a) => relSlug(a) === slug),
    );
    const prices = related
      .map((p) => p.pricePaise)
      .filter((p): p is number => typeof p === "number");
    const min = prices.length ? Math.min(...prices) : null;
    const max = prices.length ? Math.max(...prices) : null;
    return enrichApplication({
      id: String(doc.id),
      slug,
      name: String(doc.name),
      nameHi: doc.nameHi ? String(doc.nameHi) : "",
      h1: String(doc.h1),
      h1Hi: doc.h1Hi ? String(doc.h1Hi) : "",
      intro: String(doc.intro ?? ""),
      introHi: doc.introHi ? String(doc.introHi) : "",
      body: String(doc.body ?? ""),
      bodyHi: doc.bodyHi ? String(doc.bodyHi) : "",
      productChallenges: String(doc.productChallenges ?? ""),
      recommendedFillType: doc.recommendedFillType
        ? String(doc.recommendedFillType)
        : undefined,
      typicalPouchSizes: Array.isArray(doc.typicalPouchSizes)
        ? (doc.typicalPouchSizes as string[])
        : [],
      typicalFilmTypes: Array.isArray(doc.typicalFilmTypes)
        ? (doc.typicalFilmTypes as string[])
        : [],
      heroImage: doc.heroImage ? String(doc.heroImage) : undefined,
      status: String(doc.status),
      products: related,
      productCount: related.length,
      priceMinPaise: min,
      priceMaxPaise: max,
      priceRangePaise: { min_price: min, max_price: max },
    });
  });
}

export async function getApplication(slug: string): Promise<Application | null> {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "applications",
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: "published" } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const doc = result.docs[0];
  if (!doc) return null;

  const products = await getProducts(`application=${encodeURIComponent(slug)}`);
  const faqs = await payload.find({
    collection: "faqs",
    where: { "application.slug": { equals: slug } },
    limit: 50,
    depth: 0,
    sort: "sortOrder",
    overrideAccess: true,
  });

  const prices = products
    .map((p) => p.pricePaise)
    .filter((p): p is number => typeof p === "number");
  const min = prices.length ? Math.min(...prices) : null;
  const max = prices.length ? Math.max(...prices) : null;

  return enrichApplication({
    id: String(doc.id),
    slug: String(doc.slug),
    name: String(doc.name),
    nameHi: doc.nameHi ? String(doc.nameHi) : "",
    h1: String(doc.h1),
    h1Hi: doc.h1Hi ? String(doc.h1Hi) : "",
    intro: String(doc.intro ?? ""),
    introHi: doc.introHi ? String(doc.introHi) : "",
    body: String(doc.body ?? ""),
    bodyHi: doc.bodyHi ? String(doc.bodyHi) : "",
    productChallenges: String(doc.productChallenges ?? ""),
    recommendedFillType: doc.recommendedFillType
      ? String(doc.recommendedFillType)
      : undefined,
    typicalPouchSizes: Array.isArray(doc.typicalPouchSizes)
      ? (doc.typicalPouchSizes as string[])
      : [],
    typicalFilmTypes: Array.isArray(doc.typicalFilmTypes)
      ? (doc.typicalFilmTypes as string[])
      : [],
    heroImage: doc.heroImage ? String(doc.heroImage) : undefined,
    status: String(doc.status),
    products,
    productCount: products.length,
    priceMinPaise: min,
    priceMaxPaise: max,
    priceRangePaise: { min_price: min, max_price: max },
    faqs: faqs.docs.map((f) => ({
      question: String(f.question),
      answer: String(f.answer),
    })),
  });
}

export async function getMachineTypes(): Promise<MachineType[]> {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "machine-types",
    where: { status: { equals: "published" } },
    limit: 50,
    depth: 0,
    sort: "sortOrder",
    overrideAccess: true,
  });
  const products = await getProducts();
  return result.docs.map((doc) => {
    const slug = String(doc.slug);
    const related = products.filter((p) => relSlug(p.machineType) === slug);
    return {
      id: String(doc.id),
      slug,
      name: String(doc.name),
      nameHi: doc.nameHi ? String(doc.nameHi) : "",
      description: String(doc.description ?? ""),
      descriptionHi: doc.descriptionHi ? String(doc.descriptionHi) : "",
      products: related,
      productCount: related.length,
      status: String(doc.status),
    };
  });
}

export async function getMachineType(slug: string): Promise<MachineType | null> {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "machine-types",
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: "published" } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const doc = result.docs[0];
  if (!doc) return null;
  const products = await getProducts(`machine_type=${encodeURIComponent(slug)}`);
  return {
    id: String(doc.id),
    slug: String(doc.slug),
    name: String(doc.name),
    nameHi: doc.nameHi ? String(doc.nameHi) : "",
    description: String(doc.description ?? ""),
    descriptionHi: doc.descriptionHi ? String(doc.descriptionHi) : "",
    products,
    productCount: products.length,
    status: String(doc.status),
  };
}

export async function getIndustries(): Promise<Industry[]> {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "industries",
    where: { status: { equals: "published" } },
    limit: 50,
    depth: 0,
    sort: "name",
    overrideAccess: true,
  });
  const products = await getProducts();
  return result.docs.map((doc) => {
    const slug = String(doc.slug);
    const related = products.filter((p) =>
      (p.industries ?? []).some((i) => relSlug(i) === slug),
    );
    return {
      id: String(doc.id),
      slug,
      name: String(doc.name),
      nameHi: doc.nameHi ? String(doc.nameHi) : "",
      description: String(doc.description ?? ""),
      descriptionHi: doc.descriptionHi ? String(doc.descriptionHi) : "",
      products: related,
      heroImage: doc.heroImage ? String(doc.heroImage) : undefined,
      status: String(doc.status),
    };
  });
}

export async function getIndustry(slug: string): Promise<Industry | null> {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "industries",
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: "published" } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const doc = result.docs[0];
  if (!doc) return null;
  const products = await getProducts(`industry=${encodeURIComponent(slug)}`);
  return {
    id: String(doc.id),
    slug: String(doc.slug),
    name: String(doc.name),
    nameHi: doc.nameHi ? String(doc.nameHi) : "",
    description: String(doc.description ?? ""),
    descriptionHi: doc.descriptionHi ? String(doc.descriptionHi) : "",
    products,
    heroImage: doc.heroImage ? String(doc.heroImage) : undefined,
    status: String(doc.status),
  };
}

export async function getBlogPosts() {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "blog-posts",
    where: { status: { equals: "published" } },
    limit: 100,
    depth: 0,
    sort: "-publishedAt",
    overrideAccess: true,
  });
  return result.docs.map((doc) => ({
    slug: String(doc.slug),
    title: String(doc.title),
    titleHi: doc.titleHi ? String(doc.titleHi) : undefined,
    excerpt: String(doc.excerpt ?? ""),
    excerptHi: doc.excerptHi ? String(doc.excerptHi) : undefined,
    readingMins: Number(doc.readingMins ?? 5),
    publishedAt: doc.publishedAt ? String(doc.publishedAt) : null,
    tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : [],
  }));
}

export async function getBlogPost(slug: string) {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "blog-posts",
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: "published" } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const doc = result.docs[0];
  if (!doc) return null;
  return {
    slug: String(doc.slug),
    title: String(doc.title),
    titleHi: doc.titleHi ? String(doc.titleHi) : undefined,
    excerpt: String(doc.excerpt ?? ""),
    excerptHi: doc.excerptHi ? String(doc.excerptHi) : undefined,
    content: String(doc.content ?? ""),
    contentHi: doc.contentHi ? String(doc.contentHi) : undefined,
    authorName: String(doc.authorName ?? "YugMach"),
    readingMins: Number(doc.readingMins ?? 5),
    publishedAt: doc.publishedAt ? String(doc.publishedAt) : null,
  };
}

export async function getTestimonials() {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "testimonials",
    limit: 200,
    depth: 0,
    sort: "-createdAt",
    overrideAccess: true,
  });
  return result.docs.map((doc) => ({
    id: String(doc.id),
    customerName: String(doc.customerName),
    text: String(doc.text),
    textHi: doc.textHi ? String(doc.textHi) : undefined,
    rating: Number(doc.rating ?? 5),
    source: String(doc.source ?? "direct"),
    sourceUrl: doc.sourceUrl ? String(doc.sourceUrl) : undefined,
    city: String(doc.city ?? ""),
    company: doc.company ? String(doc.company) : undefined,
    isVerified: Boolean(doc.isVerified),
    isFeatured: Boolean(doc.isFeatured),
  }));
}

export async function getLocations() {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "locations",
    where: { status: { equals: "published" } },
    limit: 100,
    depth: 0,
    sort: "city",
    overrideAccess: true,
  });
  return result.docs.map((doc) => ({
    slug: String(doc.slug),
    city: String(doc.city),
    state: String(doc.state),
    h1: String(doc.h1),
  }));
}

export async function getLocation(slug: string) {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "locations",
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: "published" } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const doc = result.docs[0];
  if (!doc) return null;
  return {
    slug: String(doc.slug),
    city: String(doc.city),
    state: String(doc.state),
    h1: String(doc.h1),
    body: String(doc.body),
    service_eta: doc.serviceEta ? String(doc.serviceEta) : undefined,
  };
}

export async function getCaseStudies() {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "case-studies",
    where: { status: { equals: "published" } },
    limit: 100,
    depth: 0,
    sort: "-createdAt",
    overrideAccess: true,
  });
  return result.docs.map((doc) => ({
    slug: String(doc.slug),
    customerName: String(doc.customerName),
    customerCity: doc.customerCity ? String(doc.customerCity) : undefined,
    industry: doc.industry ? String(doc.industry) : undefined,
    challenge: String(doc.challenge),
    solution: doc.solution ? String(doc.solution) : undefined,
    results: String(doc.results),
  }));
}

export async function getCaseStudy(slug: string) {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "case-studies",
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: "published" } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const doc = result.docs[0];
  if (!doc) return null;
  return {
    slug: String(doc.slug),
    customerName: String(doc.customerName),
    customerCity: String(doc.customerCity ?? ""),
    industry: doc.industry ? String(doc.industry) : undefined,
    challenge: String(doc.challenge),
    solution: String(doc.solution),
    results: String(doc.results),
  };
}

export async function getSpareParts() {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "spare-parts",
    where: { status: { equals: "published" } },
    limit: 200,
    depth: 0,
    sort: "name",
    overrideAccess: true,
  });
  return result.docs.map((doc) => {
    const pricePaise =
      typeof doc.pricePaise === "number" ? doc.pricePaise : null;
    return {
      id: String(doc.id),
      slug: String(doc.slug),
      name: String(doc.name),
      sku: doc.sku ? String(doc.sku) : undefined,
      description: doc.description ? String(doc.description) : undefined,
      pricePaise,
      priceDisplay: formatInr(pricePaise),
    };
  });
}

export async function getFinderSteps() {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "finder-steps",
    where: { isActive: { equals: true } },
    limit: 50,
    depth: 0,
    sort: "sortOrder",
    overrideAccess: true,
  });
  return result.docs;
}

export async function getSitemapFeed() {
  const [
    products,
    applications,
    machineTypes,
    industries,
    blog,
    cases,
    locations,
  ] = await Promise.all([
    getProducts(),
    getApplications(),
    getMachineTypes(),
    getIndustries(),
    getBlogPosts(),
    getCaseStudies(),
    getLocations(),
  ]);

  const urls: Array<{ url: string; lastmod: string | null }> = [
    { url: "/", lastmod: null },
    { url: "/products", lastmod: null },
    { url: "/packing-machine", lastmod: null },
    { url: "/machines", lastmod: null },
    { url: "/industries", lastmod: null },
    { url: "/blog", lastmod: null },
    { url: "/case-studies", lastmod: null },
    { url: "/locations", lastmod: null },
    { url: "/spares", lastmod: null },
    { url: "/reviews", lastmod: null },
    { url: "/about", lastmod: null },
    { url: "/contact", lastmod: null },
  ];

  for (const p of products) urls.push({ url: `/products/${p.slug}`, lastmod: null });
  for (const a of applications)
    urls.push({ url: `/packing-machine/${a.slug}`, lastmod: null });
  for (const m of machineTypes) urls.push({ url: `/machines/${m.slug}`, lastmod: null });
  for (const i of industries) urls.push({ url: `/industries/${i.slug}`, lastmod: null });
  for (const b of blog) urls.push({ url: `/blog/${b.slug}`, lastmod: b.publishedAt });
  for (const c of cases) urls.push({ url: `/case-studies/${c.slug}`, lastmod: null });
  for (const l of locations) urls.push({ url: `/locations/${l.slug}`, lastmod: null });

  return { urls, count: urls.length };
}

export async function getSeoRedirects() {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "redirects",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });
  return result.docs.map((doc) => ({
    source: String(doc.source),
    destination: String(doc.destination),
    isPermanent: Boolean(doc.isPermanent),
  }));
}

export type LeadPayload = {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  city?: string;
  state?: string;
  message?: string;
  productToPack?: string;
  requiredPph?: number;
  pouchSizeRange?: string;
  budgetBand?: string;
  timeline?: string;
  needsFinance?: boolean;
  needsSubsidyHelp?: boolean;
  productSlug?: string;
  source?: string;
  pageUrl?: string;
  website?: string;
  company_url?: string;
};

export async function submitLead(
  payload: LeadPayload,
): Promise<{ ok: true; id?: string } | { ok: false; error: string; details?: unknown }> {
  try {
    const res = await fetch("/api/v1/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let details: unknown;
      try {
        details = await res.json();
      } catch {
        details = undefined;
      }
      return { ok: false, error: `Lead submit failed (${res.status})`, details };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}
