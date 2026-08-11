import type { Metadata } from "next";

/**
 * Hreflang / canonical helpers for pages that have an English original and
 * (sometimes) a Hindi mirror under /hi/...
 */

const HI_MIRROR_PREFIXES = ["/products", "/packing-machine", "/about", "/contact"];

const SITE_NAME = "YugMach";

export function hasHindiMirror(pathEn: string): boolean {
  if (pathEn === "/") return true;
  return HI_MIRROR_PREFIXES.some((p) => pathEn === p || pathEn.startsWith(`${p}/`));
}

export function hindiPath(pathEn: string): string {
  return pathEn === "/" ? "/hi" : `/hi${pathEn}`;
}

export function englishPath(pathHi: string): string {
  if (pathHi === "/hi") return "/";
  return pathHi.replace(/^\/hi/, "") || "/";
}

/**
 * Given an English canonical path (e.g. "/products/foo"), return the
 * `alternates` shape for Next.js Metadata: a canonical URL plus a
 * `languages` map pointing at the English and (if it exists) Hindi mirror.
 */
export function hreflangAlternates(pathEn: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const languages: Record<string, string> = {
    en: pathEn,
    "x-default": pathEn,
  };
  if (hasHindiMirror(pathEn)) {
    languages.hi = hindiPath(pathEn);
  }
  return { canonical: pathEn, languages };
}

/**
 * Same as `hreflangAlternates` but called from a Hindi page — pass the
 * Hindi path (e.g. "/hi/products/foo") and get canonical + languages back,
 * always including the English original.
 */
export function hreflangAlternatesForHindi(pathHi: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const en = englishPath(pathHi);
  return {
    canonical: pathHi,
    languages: { en, hi: pathHi, "x-default": en },
  };
}

/** Canonical-only alternates for pages without a Hindi mirror. */
export function canonicalOnly(pathEn: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  return {
    canonical: pathEn,
    languages: { en: pathEn, "x-default": pathEn },
  };
}

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  /** Use Hindi hreflang when a mirror exists; otherwise canonical-only. */
  withHreflang?: boolean;
  image?: string | null;
  noIndex?: boolean;
};

/**
 * Shared metadata builder — title, description, canonical/hreflang, Open Graph, Twitter.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  withHreflang = true,
  image,
  noIndex = false,
}: PageSeoInput): Metadata {
  const cleanTitle = title.slice(0, 60);
  const cleanDesc = description.slice(0, 160);
  const alternates = withHreflang ? hreflangAlternates(path) : canonicalOnly(path);
  const ogImages = image ? [{ url: image }] : undefined;

  return {
    title: cleanTitle,
    description: cleanDesc,
    alternates,
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: SITE_NAME,
      title: cleanTitle,
      description: cleanDesc,
      url: path,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: cleanDesc,
      images: image ? [image] : undefined,
    },
  };
}
