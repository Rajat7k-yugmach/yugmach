import { formatInrFromPaise } from "@/lib/money";
import type { PriceRangePaise, TaxonomyRef } from "@/lib/api/types";

export function taxonomySlug(ref: TaxonomyRef | null | undefined): string | null {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  return ref.slug;
}

export function taxonomyName(ref: TaxonomyRef | null | undefined): string | null {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  return ref.name;
}

export function resolvePriceRange(input: {
  priceRangePaise?: PriceRangePaise;
  priceMinPaise?: number | null;
  priceMaxPaise?: number | null;
  priceMinDisplay?: string | null;
  priceMaxDisplay?: string | null;
  productCount?: number;
}): {
  minDisplay: string | null;
  maxDisplay: string | null;
  productCount?: number;
} {
  const minPaise = input.priceMinPaise ?? input.priceRangePaise?.min_price ?? null;
  const maxPaise = input.priceMaxPaise ?? input.priceRangePaise?.max_price ?? null;
  return {
    minDisplay: input.priceMinDisplay ?? formatInrFromPaise(minPaise),
    maxDisplay: input.priceMaxDisplay ?? formatInrFromPaise(maxPaise),
    productCount: input.productCount,
  };
}

export function priceRangeLabel(
  minDisplay: string | null | undefined,
  maxDisplay: string | null | undefined,
  productCount?: number,
): string {
  if (minDisplay && maxDisplay && minDisplay !== maxDisplay) {
    const countBit = productCount != null ? ` · ${productCount} machines` : "";
    return `${minDisplay} – ${maxDisplay}${countBit}`;
  }
  if (minDisplay) {
    const countBit = productCount != null ? ` · ${productCount} machines` : "";
    return `From ${minDisplay}${countBit}`;
  }
  return productCount != null ? `${productCount} machines` : "Prices on request";
}

export function isThinBody(body: string | null | undefined): boolean {
  if (!body) return true;
  const words = body.trim().split(/\s+/).filter(Boolean);
  return words.length < 80;
}

export function capacityFromSpecs(specs: Record<string, unknown>): string | null {
  const raw = specs.capacity_pph ?? specs.capacityPph;
  if (raw == null || raw === "") return null;
  return `${raw} PPH`;
}

export function fillTypeFromSpecs(specs: Record<string, unknown>): string | null {
  const raw = specs.fill_type ?? specs.fillType;
  if (raw == null || raw === "") return null;
  return String(raw);
}
