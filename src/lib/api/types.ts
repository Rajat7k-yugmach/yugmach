export type { LeadPayload } from "./leads";
export type {
  Application,
  Industry,
  MachineType,
  ProductDetail,
  ProductListItem,
  TaxonomyRef,
} from "./catalogue";

export type FaqItem = {
  question: string;
  answer: string;
  sortOrder?: number;
};

export type PriceRangePaise = {
  min_price: number | null;
  max_price: number | null;
};

export type ApplicationListItem = import("./catalogue").Application;
export type ApplicationDetail = import("./catalogue").Application;
export type IndustryListItem = import("./catalogue").Industry;
export type IndustryDetail = import("./catalogue").Industry & { products: import("./catalogue").ProductListItem[] };
export type MachineTypeListItem = import("./catalogue").MachineType;
export type MachineTypeDetail = import("./catalogue").MachineType;
export type BlogListItem = {
  slug: string;
  title: string;
  titleHi?: string;
  excerpt: string;
  readingMins?: number;
};
export type BlogDetail = BlogListItem & { content: string; contentHi?: string };
export type CaseStudyListItem = {
  slug: string;
  customerName: string;
  customerCity?: string;
  industry?: string;
  challenge: string;
  results: string;
};
export type CaseStudyDetail = CaseStudyListItem & {
  customerCity: string;
  solution: string;
};
export type Testimonial = {
  id?: string;
  customerName: string;
  text: string;
  rating: number;
  city?: string;
  sourceUrl?: string;
};
export type LocationPage = {
  slug: string;
  city: string;
  state: string;
  h1: string;
  body: string;
};
export type SparePart = {
  id: string;
  name: string;
  description?: string;
  priceDisplay?: string | null;
};
export type SpecField = {
  id: string;
  key: string;
  label: string;
  labelHi: string;
  dataType: string;
  group: string;
  unit: string;
  isFilterable: boolean;
  isComparable: boolean;
  showInSummary: boolean;
};
export type ProductFilters = {
  application?: string;
  machineType?: string;
  industry?: string;
  minPrice?: string;
  maxPrice?: string;
  fillType?: string;
  ordering?: string;
};
