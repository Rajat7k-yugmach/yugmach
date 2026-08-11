# Legacy YugMach website audit

**Audited:** 2026-08-08  
**Sources:** public repo [`rajat7k/yug-mach-web`](https://github.com/rajat7k/yug-mach-web) (clone `/tmp/yug-mach-web`, `main` @ `1020d04`) · live site [`https://www.yugmach.com`](https://www.yugmach.com)  
**Purpose:** Phase 0 baseline for the rebuild described in `YUGMACH-Build-Prompt.md` — stack inventory, live URL crawl, Firestore/Cloudinary notes, defect confirmation, and **complete old → new redirect map**.

---

## 1. Executive summary

The legacy site is a thin Next.js 15 brochure app with only **two real page routes** (`/` and `/blog` + `/blog/[slug]`). Product and blog content live in **Firestore** and are loaded **client-side** after hydration, so crawlers see loading placeholders. The root layout hardcodes `<link rel="canonical" href="https://www.yugmach.com" />` on **every** response — verified live on `/blog` and all blog posts. The generated sitemap contains only `/` and `/blog`.

Ranking equity at risk from the rebuild is effectively **none**: the domain has been telling Google every URL is the homepage.

**Carry forward:** Cloudinary cloud `dab2jnv1e`, domain/DNS, exported Firestore product + blog records (reconcile then retire Firebase).  
**Do not carry forward:** styled-components, three.js, framer-motion, FontAwesome/react-icons dual icon stacks, client Firestore data layer, hand-written `<head>` tags / `next/head` on App Router pages.

---

## 2. Stack summary

| Layer | Legacy choice | Notes |
|---|---|---|
| Framework | Next.js `^15.4.2` App Router | `src/app/` |
| UI | React `^19.0.0` | Homepage + blog pages are `'use client'` |
| Language | TypeScript 5 | |
| Styling | Tailwind `^3.4.1` + **styled-components `^6.1.14`** | `next.config.ts` enables `compiler.styledComponents` |
| Data | **Firebase JS `^11.1.0` / Firestore** | Client SDK used from API routes (misnamed `firebaseAdmin.ts`) |
| Images | **next-cloudinary `^6.16.0`** | Cloud name **`dab2jnv1e`** hardcoded in URLs |
| Motion / 3D | framer-motion `^12`, three.js `^0.172` | Bundle-heavy for a brochure site |
| Icons | FontAwesome + react-icons | Dual stacks |
| Analytics | `@vercel/analytics` | |
| Sitemap | `next-sitemap` `^4.2.3` via `postbuild` | Nearly empty (see §7) |
| Hosting | **Vercel** | Live headers: `server: Vercel`, `x-vercel-id: bom1::…` (Mumbai edge) |
| Repo | Public GitHub | Default README still create-next-app boilerplate |

### 2.1 Vercel / env configuration

No `vercel.json` and no committed `.env*` (`.gitignore` ignores `.env*` and `.vercel`).

**Required / used env vars (from source):**

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `src/app/db/firebaseAdmin.ts`, upload script |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | same |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | same |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | same |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | same |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | same |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | same |
| `SITE_URL` | `next-sitemap.config.js` (fallback `https://www.yugmach.com`) |

**Implied for next-cloudinary (not referenced in app code; typically set in Vercel):** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dab2jnv1e` (or equivalent). All image `src` values already embed the full `res.cloudinary.com/dab2jnv1e/...` URL.

**`next.config.ts`:** styled-components compiler; `images.domains` = `res.cloudinary.com`, `images.unsplash.com` (Unsplash unused in audited sources).

**npm scripts:** `dev` (turbopack), `build`, `start`, `lint`, `postbuild` → `next-sitemap`, `upload-products` → `node fullProductUpload.js` (script actually lives at `scripts/fullProductUpload.js` — package.json path looks stale).

---

## 3. Route enumeration (`src/app/`)

### 3.1 Page routes (user-facing)

| File | URL | Rendering | Notes |
|---|---|---|---|
| `src/app/(routes)/page.tsx` | `/` | Client component | Hero, info, packaging, gallery, contact sections |
| `src/app/(routes)/blog/page.tsx` | `/blog` | Client + `useBlogs` | Listing, filters, sidebar |
| `src/app/(routes)/blog/[slug]/page.tsx` | `/blog/[slug]` | Client + `useBlogs` | Soft-200 for unknown slugs (shell always 200) |

Route group `(routes)` does **not** affect the URL path.

### 3.2 API routes

| File | Method | Path | Firestore |
|---|---|---|---|
| `src/app/api/getProducts/route.ts` | `GET` | `/api/getProducts` | reads `products` |
| `src/app/api/getBlogs/route.ts` | `GET` | `/api/getBlogs` | reads `blogs` (published only) |
| `src/app/api/submitEnquiry/route.ts` | `POST` | `/api/submitEnquiry` | writes `enquiries` |

**Dead / duplicate copies (not under `app/api`, not reachable as routes):**

- `src/app/services/apis/getProducts/route.ts`
- `src/app/services/apis/submitEnquiry/route.ts`

### 3.3 Non-route app modules

`layout.tsx`, `globals.css`, `registry.tsx` (styled-components), `favicon.ico`, `components/*`, `hooks/*`, `db/firebaseAdmin.ts`.

### 3.4 In-page “pseudo-routes” (hash / scroll, not separate pages)

Nav/footer use `onClick` + `router.push`, **not** crawlable `<a href>`:

| Pseudo-target | Behaviour |
|---|---|
| `/#products-section` | Scroll to gallery / products |
| `/#contact-us-section` | Scroll to contact form |
| Footer Privacy / Terms / Sitemap | `href="#"` (no pages) |

There are **no** legacy pages for `/about`, `/contact`, `/machines`, `/products`, `/service`, etc. (all 404 live).

---

## 4. Live crawl — URLs returning 200

### 4.1 `robots.txt` (200)

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Host: https://www.yugmach.com
Sitemap: https://www.yugmach.com/sitemap.xml
```

### 4.2 `sitemap.xml` (200) — nearly empty

Only two `<url>` entries:

1. `https://www.yugmach.com`
2. `https://www.yugmach.com/blog`

No product URLs, no blog post URLs. Matches `next-sitemap.config.js` behaviour (see §7).

### 4.3 Homepage HTML crawl

Raw HTML for `/` contains almost **no** internal nav `<a href>` links — header/footer are client components with click handlers. Extracted internal document links of substance:

| URL | Status | Role |
|---|---|---|
| `https://www.yugmach.com/` | 200 | Home |
| `https://www.yugmach.com/favicon.ico` | 200 | Icon |
| `https://www.yugmach.com/robots.txt` | 200 | Robots |
| `https://www.yugmach.com/sitemap.xml` | 200 | Sitemap |

External links present in HTML: WhatsApp `wa.me/7500399754`, IndiaMART, LinkedIn.

### 4.4 Source-derived + API-derived crawl (all verified HTTP 200)

| URL | Status | Notes |
|---|---|---|
| `/` | 200 | Contains `Loading products...` in raw HTML |
| `/blog` | 200 | Contains `Loading blog posts...`; **canonical → homepage** |
| `/blog/how-to-choose-right-packaging-machine` | 200 | Live slug; loading shell first |
| `/blog/essential-maintenance-tips-auger-fillers` | 200 | |
| `/blog/sustainable-packaging-solutions` | 200 | |
| `/blog/choosing-right-spice-packaging-machine` | 200 | |
| `/blog/future-of-packaging-automation` | 200 | |
| `/blog/maintenance-tips-packaging-machines` | 200 | |
| `/blog/packaging-machine-safety-guidelines` | 200 | |
| `/api/getProducts` | 200 | JSON — 6 products |
| `/api/getBlogs` | 200 | JSON — 7 published blogs |
| `/favicon.ico` | 200 | Also used as `og:image` |
| `/robots.txt` | 200 | |
| `/sitemap.xml` | 200 | |

**Also 200 but soft-404 shells** (client route always renders; content says not found after load): `/blog/test`, `/blog/does-not-exist`, any unknown `/blog/*`.

### 4.5 Confirmed 404 (selected probes)

`/about`, `/contact`, `/machines`, `/products`, `/gallery`, `/service`, `/privacy`, `/terms`, `/sitemap`, `/yugMach.svg` (referenced in JSON-LD/twitter but missing), and all `/machines/*`, `/packing-machine/*`, `/products/*` new-IA paths — **404 today** (expected; greenfield for rebuild).

`POST /api/submitEnquiry` → **405** on GET (method-bound).

### 4.6 Hosting fingerprint

Response headers include `server: Vercel`, `x-vercel-cache: HIT`, `x-nextjs-prerender: 1`, region hint `bom1` in `x-vercel-id`.

---

## 5. Firestore collections

| Collection | Access | Shape / notes |
|---|---|---|
| **`products`** | `getDocs` via `/api/getProducts` | Doc IDs = product ids. Fields: `name`, `description`, `src`, `alt`, `specs[]`, `indiaMartLink` (live values are WhatsApp deep links) |
| **`blogs`** | `getDocs` via `/api/getBlogs` | Filtered `isPublished`; fields include `slug`, `title`, `excerpt`, `content` (HTML), `featuredImage`, `category`, `tags`, `author`, `publishDate`, `readTime`, SEO fields |
| **`enquiries`** | `addDoc` via `/api/submitEnquiry` | Lead capture writes |

Constants file lists only `products` + `enquiries`; **`blogs` is used in code but omitted from `FIREBASE_COLLECTIONS`**.

`src/app/db/firebaseAdmin.ts` is **not** the Admin SDK — it initializes the **client** Firebase app with `NEXT_PUBLIC_*` keys and `getFirestore(app)`.

### 5.1 Live product export (2026-08-08 via `/api/getProducts`)

| id | name | specs (summary) | image |
|---|---|---|---|
| `auger-filler` | Automatic Auger Filler Spice Packing Machine | Filling capacity: 2gm - 1 KG; Speed: 25-60 bags/min; Power: 2.5 kW; Dimensions: 1500x1900x2900mm | `https://res.cloudinary.com/dab2jnv1e/image/upload/v1736187199/20241217_203719_uik7el.jpg` |
| `collar-type` | Automatic Collar Type Packing Machine | Filling range: 250-1000g; Speed: 20-60 bags/min; Power: 2.8 kW; Dimensions: 1350x850x1950mm | `https://res.cloudinary.com/dab2jnv1e/image/upload/v1744786615/WhatsApp_Image_2025-04-16_at_12.26.18_PM_ci5w42.jpg` |
| `flow-wrap` | Flow Wrap Packaging Machine | Product length: 50-300mm; Product width: 10-150mm; Speed: 40-230 bags/min; Power: 3.2 kW | `https://res.cloudinary.com/dab2jnv1e/image/upload/v1736187312/20241218_180914_fl84xk.jpg` |
| `multi-head-weigher` | Multi-Head Weigher Packing System | Weighing range: 5-1 kG; Speed: 40-60 bags/min; Accuracy: +/-0.5g; Power: 4.0 kW | `https://res.cloudinary.com/dab2jnv1e/image/upload/v1744786120/671087c3410a3_ydlint.jpg` |
| `pneumatic-packing` | Pneumatic Packing Machine | Filling range: 10-1000g; Speed: 25-60 ppm; Air pressure: 0.4-0.6 MPa; Power: 1.5 kW | `https://res.cloudinary.com/dab2jnv1e/image/upload/v1736187362/20241217_204457_xrse6d.jpg` |
| `vertical-form-fill` | Vertical Form Fill Seal Machine | Bag width: 50-200mm; Bag length: 50-350mm; Speed: 30-60 bags/min; Power: 3.5 kW | `https://res.cloudinary.com/dab2jnv1e/image/upload/v1736187442/20241217_195740_urtzyf.jpg` |

**Legacy product IDs → new IA machine-type pages (conceptual):**

| Legacy Firestore id | Closest new path |
|---|---|
| `auger-filler` | `/machines/auger-filler` (+ related SKUs under `/products/*`) |
| `collar-type` | `/machines/collar-type` |
| `flow-wrap` | `/machines/flow-wrap` |
| `multi-head-weigher` | `/machines/multi-head-weigher` |
| `pneumatic-packing` | `/machines/pneumatic-pouch` (catalogue slug `pneumatic-pouch-packing-machine`) |
| `vertical-form-fill` | `/machines/vffs` (catalogue has `100-ppm-vertical-form-fill-seal-machine`, etc.) |

Closest **SKU** matches for rebuild seeding (from `YUGMACH-Product-Catalogue.csv`):

| Legacy id | Suggested product slug(s) |
|---|---|
| `auger-filler` | `automatic-spice-packaging-machine` (spice/auger family) |
| `pneumatic-packing` | `pneumatic-pouch-packing-machine` |
| `vertical-form-fill` | `100-ppm-vertical-form-fill-seal-machine` |
| `collar-type` | `automatic-sooji-rawa-packing-machine` / collar-type family |
| `flow-wrap` | `500-pph-fully-automatic-flow-wrap-packaging-machine` / `horizontal-flow-wrap-machine` |
| `multi-head-weigher` | `multi-head-weigher-packing-machine` |

> Spec strings in Firestore differ from seed script and from IndiaMART CSV prices — treat Firestore as **partial / stale**; reconcile in `docs/data-gaps.md`.

### 5.2 Live blog export (2026-08-08 via `/api/getBlogs`)

| slug | title | category | publishDate | published |
|---|---|---|---|---|
| `choosing-right-spice-packaging-machine` | How to Choose the Right Spice Packaging Machine for Your Business | Machine Selection | 2023-12-25 | yes |
| `essential-maintenance-tips-auger-fillers` | Essential Maintenance Tips for Auger Filler Machines | Maintenance Tips | 2024-01-18 | yes |
| `future-of-packaging-automation` | The Future of Packaging Automation: Trends to Watch in 2024 | Industry Trends | 2023-12-20 | yes |
| `how-to-choose-right-packaging-machine` | How to Choose the Right Packaging Machine for Your Business | Machine Selection | 2024-01-20 | yes |
| `maintenance-tips-packaging-machines` | Essential Maintenance Tips for Long-Lasting Packaging Machines | Maintenance Tips | 2023-12-15 | yes |
| `packaging-machine-safety-guidelines` | Safety Guidelines for Operating Packaging Machines | Technical Guides | 2023-12-10 | yes |
| `sustainable-packaging-solutions` | Sustainable Packaging Solutions: Going Green in Manufacturing | Industry Trends | 2023-12-28 | yes |

---

## 6. Cloudinary notes (cloud `dab2jnv1e`)

**URL pattern:**

```
https://res.cloudinary.com/dab2jnv1e/image/upload/v{version}/{public_id}
```

**Base constant:** `CLOUDINARY_CONFIG.baseUrl = https://res.cloudinary.com/dab2jnv1e/image/upload/`

Assets are stored as **flat public IDs** (camera/WhatsApp filenames), not under `yugmach/products/<slug>/`. Rebuild should re-organise into that folder structure without discarding these files.

### 6.1 Unique assets found in repo + live API (10)

| Full URL | Public ID (approx.) | Usage |
|---|---|---|
| `…/v1736187199/20241217_203719_uik7el.jpg` | `20241217_203719_uik7el` | Auger / blog featured / packaging |
| `…/v1736187404/20241217_200819_dyvsdf.png` | `20241217_200819_dyvsdf` | Fallback pneumatic (repo); superseded live |
| `…/v1736187442/20241217_195740_urtzyf.jpg` | `20241217_195740_urtzyf` | VFFS |
| `…/v1736187362/20241217_204457_xrse6d.jpg` | `20241217_204457_xrse6d` | Collar / hero / pneumatic live |
| `…/v1736187312/20241218_180914_fl84xk.jpg` | `20241218_180914_fl84xk` | Flow wrap |
| `…/v1736187313/20241218_181122_vbxsma.jpg` | `20241218_181122_vbxsma` | Multi-head (repo); info section |
| `…/v1736191372/20241217_195740_d0tbfs.png` | `20241217_195740_d0tbfs` | Packaging section |
| `…/v1736281665/yugmachLogo_tgqptx.jpg` | `yugmachLogo_tgqptx` | Logo / author avatar |
| `…/v1744786120/671087c3410a3_ydlint.jpg` | `671087c3410a3_ydlint` | **Live** multi-head (Firestore only) |
| `…/v1744786615/WhatsApp_Image_2025-04-16_at_12.26.18_PM_ci5w42.jpg` | `WhatsApp_Image_2025-04-16_at_12.26.18_PM_ci5w42` | **Live** collar-type (Firestore only) |

Cloudinary account likely holds more assets than referenced in code — inventory the cloud dashboard before cutover.

---

## 7. Critical defect confirmation

| # | Defect | Confirmed? | Evidence |
|---|---|---|---|
| 1 | **Hardcoded canonical → homepage on all routes** | **YES** | `layout.tsx` L145: `<link rel="canonical" href="https://www.yugmach.com" />`. Live `/blog` and every `/blog/[slug]` HTML emit that same canonical (page-level `next/head` canonicals are ineffective / overridden in practice). |
| 2 | No per-route Metadata API for blog/home content pages | **YES** | Root `export const metadata` only; blog pages are `'use client'` and use Pages-router-style `next/head`. |
| 3 | **Client-side Firestore product loading** | **YES** | `useProducts` → `fetch('/api/getProducts')` in `useEffect`. Live `/` HTML contains **`Loading products...`**. |
| 4 | **Client-side Firestore blog loading** | **YES** | `useBlogs` → `fetch('/api/getBlogs')`. Live `/blog` HTML contains **`Loading blog posts...`**. |
| 5 | **`additionalPaths` empty of products/posts** | **YES** | `next-sitemap.config.js` L46–56: comment *"This would need to be implemented to fetch blog posts from Firebase"*; returns only `{ loc: '/blog' }`. Live sitemap = `/` + `/blog` only. |
| 6 | `og:image` = `/favicon.ico` | **YES** | Root metadata |
| 7 | `twitter:image` = SVG logo URL | **YES** | Hand-written twitter meta; `/yugMach.svg` itself **404**s |
| 8 | Duplicate meta (Metadata API + manual `<head>`) | **YES** | `layout.tsx` |
| 9 | Hardcoded Organization JSON-LD with 3 products | **YES** | Does not match 6 Firestore / 37 catalogue machines |
| 10 | `lang="en"` not `en-IN` | **YES** | |
| 11 | Keyword stuffing | **YES** | 21 keywords in metadata |
| 12 | Footer Privacy/Terms/Sitemap `href="#"` | **YES** | |
| 13 | Copyright hardcoded `© 2025` | **PARTIAL** | Source now uses `new Date().getFullYear()` — defect mitigated in code; still no legal pages |
| 14 | Bundle bloat (three / framer / styled-components / dual icons) | **YES** | `package.json` |
| 15 | Geist latin-only | **YES** | |
| 16 | 3 machine types in marketing vs 37 SKUs | **YES** | Packaging section highlights 3; gallery has 6 Firestore docs |
| 17 | No prices on site | **YES** | |
| 18 | Outbound IndiaMART in nav/hero/contact/footer | **YES** | (Live product `indiaMartLink` fields oddly point at WhatsApp) |
| 19 | Default create-next-app README | **YES** | |

### 7.1 Canonical bug — verbatim

```tsx
// src/app/layout.tsx (root layout <head>)
<link rel="canonical" href="https://www.yugmach.com" />
```

Live check (2026-08-08): `GET /blog` → `rel=canonical` href is `https://www.yugmach.com` (homepage), not `/blog`.

### 7.2 Sitemap `additionalPaths` — verbatim

```js
additionalPaths: async (config) => {
  // This would need to be implemented to fetch blog posts from Firebase
  // For now, we'll add the blog listing page
  return [
    {
      loc: '/blog',
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    },
  ];
},
```

---

## 8. Complete old-URL → new-URL redirect map

Convention: **301** permanent unless noted. Host remains `https://www.yugmach.com` (www). Hindi mirrors (`/hi/...`) should receive the same relative mapping when the Hindi tree ships.

### 8.1 Core pages & fragments (must ship at cutover)

| Old URL | New URL | Type | Notes |
|---|---|---|---|
| `/` | `/` | keep | Same URL |
| `/#products-section` | `/products` | 301 (path) / UX | Hash ignored by servers; also update internal links. Optional landing: `/machines` |
| `/#contact-us-section` | `/contact` | 301 (path) / UX | Same |
| `/blog` | `/blog` | keep | Same URL |
| `/blog/` | `/blog` | 301 | Trailing slash normalize |
| `/favicon.ico` | `/favicon.ico` | keep | Replace asset |
| `/robots.txt` | `/robots.txt` | keep | Regenerate |
| `/sitemap.xml` | `/sitemap.xml` | keep | Regenerate full tree |
| `/yugMach.svg` | `/brand/yugmach-logo.svg` (or Cloudinary logo) | 301 if reintroduced | Currently 404; JSON-LD still references it |

### 8.2 Blog posts (live slugs → same slugs under new blog)

| Old URL | New URL | Type |
|---|---|---|
| `/blog/how-to-choose-right-packaging-machine` | `/blog/how-to-choose-right-packaging-machine` | keep (re-SSR content) |
| `/blog/essential-maintenance-tips-auger-fillers` | `/blog/essential-maintenance-tips-auger-fillers` | keep |
| `/blog/sustainable-packaging-solutions` | `/blog/sustainable-packaging-solutions` | keep |
| `/blog/choosing-right-spice-packaging-machine` | `/blog/choosing-right-spice-packaging-machine` | keep |
| `/blog/future-of-packaging-automation` | `/blog/future-of-packaging-automation` | keep |
| `/blog/maintenance-tips-packaging-machines` | `/blog/maintenance-tips-packaging-machines` | keep |
| `/blog/packaging-machine-safety-guidelines` | `/blog/packaging-machine-safety-guidelines` | keep |
| `/blog/category/machine-selection` | `/blog/category/machine-selection` | new (no old URL) |
| `/blog/category/maintenance-tips` | `/blog/category/maintenance-tips` | new |
| `/blog/category/industry-trends` | `/blog/category/industry-trends` | new |
| `/blog/category/case-studies` | `/blog/category/case-studies` | new |
| `/blog/category/technical-guides` | `/blog/category/technical-guides` | new |
| `/blog/*` (unknown soft-200) | `/blog` or `/404` | cleanup | Stop returning 200 for missing posts |

### 8.3 Legacy product IDs as if they were paths (defensive)

Old site never published dedicated product URLs, but IDs appear in Firestore/API and may be guessed or bookmarked. Add redirects **anyway**:

| Old URL (hypothetical / defensive) | New URL | Type |
|---|---|---|
| `/auger-filler` | `/machines/auger-filler` | 301 |
| `/collar-type` | `/machines/collar-type` | 301 |
| `/flow-wrap` | `/machines/flow-wrap` | 301 |
| `/multi-head-weigher` | `/machines/multi-head-weigher` | 301 |
| `/pneumatic-packing` | `/machines/pneumatic-pouch` | 301 |
| `/vertical-form-fill` | `/machines/vffs` | 301 |
| `/products/auger-filler` | `/machines/auger-filler` | 301 |
| `/products/collar-type` | `/machines/collar-type` | 301 |
| `/products/flow-wrap` | `/machines/flow-wrap` | 301 |
| `/products/multi-head-weigher` | `/machines/multi-head-weigher` | 301 |
| `/products/pneumatic-packing` | `/machines/pneumatic-pouch` | 301 |
| `/products/vertical-form-fill` | `/machines/vffs` | 301 |
| `/machines/pneumatic-packing` | `/machines/pneumatic-pouch` | 301 |
| `/machines/vertical-form-fill` | `/machines/vffs` | 301 |

### 8.4 Legacy API → new backend (not SEO, but cutover map)

| Old URL | New URL | Notes |
|---|---|---|
| `/api/getProducts` | `/api/v1/products/` (Django) | Do not 301 publicly; retire or 410 after cutover |
| `/api/getBlogs` | `/api/v1/blog/` | same |
| `/api/submitEnquiry` | `/api/v1/leads/` (or equivalent) | same |
| `/admin/*` | Django Admin host / path | robots already disallow `/admin/` |

### 8.5 New IA paths with **no** legacy equivalent (create; no redirect needed)

These are greenfield destinations from `YUGMACH-Build-Prompt.md` §4.1. Listed so the redirect table is complete relative to the target sitemap.

#### Machine types

| New URL |
|---|
| `/machines` |
| `/machines/vffs` |
| `/machines/collar-type` |
| `/machines/flow-wrap` |
| `/machines/pneumatic-pouch` |
| `/machines/multi-head-weigher` |
| `/machines/auger-filler` |

#### Applications (`/packing-machine/*`)

| New URL |
|---|
| `/packing-machine` |
| `/packing-machine/namkeen` |
| `/packing-machine/masala` |
| `/packing-machine/haldi-powder` |
| `/packing-machine/dhaniya-powder` |
| `/packing-machine/garam-masala` |
| `/packing-machine/meat-masala` |
| `/packing-machine/sooji-rawa` |
| `/packing-machine/kurkure` |
| `/packing-machine/banana-chips` |
| `/packing-machine/snacks` |
| `/packing-machine/popcorn` |
| `/packing-machine/rusk` |
| `/packing-machine/tea` |
| `/packing-machine/coffee` |
| `/packing-machine/supari` |
| `/packing-machine/mustard-seeds` |
| `/packing-machine/mehandi` |
| `/packing-machine/detergent-powder` |
| `/packing-machine/detergent-cake` |
| `/packing-machine/soap` |
| `/packing-machine/sanitary-pad` |
| `/packing-machine/tobacco` |
| `/packing-machine/powder` |
| `/packing-machine/pouch` |

#### Product SKUs (`/products/[slug]`) — all 37

| New URL |
|---|
| `/products` |
| `/products/automatic-sooji-rawa-packing-machine` |
| `/products/500-pph-fully-automatic-flow-wrap-packaging-machine` |
| `/products/2100-pph-automatic-food-pouch-making-machine` |
| `/products/100-pph-automatic-pouch-packing-machine` |
| `/products/500-pph-automatic-powder-packing-machine` |
| `/products/2400-pph-namkeen-packing-machine` |
| `/products/1000-pph-automatic-namkeen-packing-machine` |
| `/products/500-pph-snack-packing-machine` |
| `/products/2000-pph-automatic-kurkure-packing-machine` |
| `/products/500-pph-banana-chips-packaging-machine` |
| `/products/mehandi-powder-packing-machine` |
| `/products/pneumatic-pouch-packing-machine` |
| `/products/pouch-packaging-machine` |
| `/products/coffee-powder-packing-machine` |
| `/products/tea-packing-machine` |
| `/products/garam-masala-packing-machine` |
| `/products/haldi-powder-packing-machine` |
| `/products/masala-packing-machine` |
| `/products/automatic-spice-packaging-machine` |
| `/products/2400-pph-automatic-spice-packing-machine` |
| `/products/automatic-dhaniya-powder-packing-machine` |
| `/products/automatic-packaging-machine` |
| `/products/multi-head-weigher-packing-machine` |
| `/products/automatic-mustard-seeds-packing-machine` |
| `/products/2000-pph-pneumatic-pouch-packing-machine` |
| `/products/supari-packing-machine` |
| `/products/1200-pph-automatic-detergent-cake-packing-machine` |
| `/products/40-ppm-detergent-surf-packing-machine` |
| `/products/tobacco-pouch-packing-machine` |
| `/products/meat-masala-packing-machine` |
| `/products/100-ppm-vertical-form-fill-seal-machine` |
| `/products/50-ppm-automatic-form-fill-seal-machine` |
| `/products/soap-packaging-machine` |
| `/products/sanitary-pad-packing-machine` |
| `/products/popcorn-pouch-packing-machine` |
| `/products/rusk-packing-machine` |
| `/products/horizontal-flow-wrap-machine` |

#### Tools, industries, service, content, company, legal

| New URL |
|---|
| `/compare` |
| `/machine-finder` |
| `/industries` |
| `/industries/food-processing` |
| `/industries/spices` |
| `/industries/snacks-namkeen` |
| `/industries/beverages` |
| `/industries/home-care` |
| `/industries/personal-care` |
| `/industries/agro-products` |
| `/subsidy/pmfme-packaging-machine` |
| `/finance/emi-calculator` |
| `/finance/roi-calculator` |
| `/service` |
| `/service/installation` |
| `/service/training` |
| `/service/amc` |
| `/service/warranty` |
| `/service/coverage` |
| `/spares` |
| `/gallery` |
| `/videos` |
| `/case-studies` |
| `/reviews` |
| `/about` |
| `/about/factory` |
| `/about/team` |
| `/contact` |
| `/partners/become-a-dealer` |
| `/export` |
| `/careers` |
| `/privacy` |
| `/terms` |
| `/refund-and-warranty-policy` |
| `/sitemap` |
| `/locations/mathura` |
| `/locations/agra` |
| `/locations/delhi-ncr` |
| `/locations/jaipur` |
| `/locations/kanpur` |
| `/locations/indore` |
| `/locations/ahmedabad` |
| `/locations/ludhiana` |

Footer placeholders that currently 404-as-`#` should become real pages:

| Old (broken) | New URL |
|---|---|
| `#` “Privacy Policy” | `/privacy` |
| `#` “Terms of Service” | `/terms` |
| `#` “Sitemap” | `/sitemap` |

### 8.6 Suggested “intent” redirects from old single-page UX

| Old behaviour / link text | New URL |
|---|---|
| Nav “Products” | `/products` |
| Nav “Blog” | `/blog` |
| Nav “Contact” | `/contact` |
| Nav “Home” | `/` |
| Footer “Our Products” | `/products` |
| Footer “Contact Us” | `/contact` |
| Footer “India Mart Store” | **remove** from primary CTAs; optional single footer proof link to IndiaMART reviews (not a redirect) |
| Hero / IndiaMART CTA | `/contact` or WhatsApp deep link |
| Gallery modal for `auger-filler` | `/machines/auger-filler` or best SKU |
| Gallery modal for `collar-type` | `/machines/collar-type` |
| Gallery modal for `flow-wrap` | `/machines/flow-wrap` |
| Gallery modal for `multi-head-weigher` | `/machines/multi-head-weigher` |
| Gallery modal for `pneumatic-packing` | `/machines/pneumatic-pouch` |
| Gallery modal for `vertical-form-fill` | `/machines/vffs` |

### 8.7 Implementation notes for redirects

1. Seed `seo.Redirect` (Django) from **§8.1–8.3** at minimum; export to Next `redirects` in `next.config` + middleware fallback per architecture.
2. Prefer **host-relative** sources (`/blog`, not absolute) so apex/`www` middleware can normalize once.
3. After DNS cutover off Vercel → CloudFront, keep Vercel project live until TTL clears, with the same redirect rules if any traffic still hits it.
4. Because legacy soft-200 blog URLs never indexed usefully (canonical→home), **orphan blog soft-404s need not be preserved** — return real 404.

---

## 9. Carry-forward checklist

- [x] Clone/inspect public repo  
- [x] Enumerate `src/app` routes  
- [x] Enumerate Firestore collections (`products`, `blogs`, `enquiries`)  
- [x] Inventory Cloudinary `dab2jnv1e` URL patterns + referenced assets  
- [x] Document Vercel/env surface  
- [x] Crawl live site (sitemap, robots, nav/footer behaviour, APIs)  
- [x] Confirm critical bugs (canonical, CSR Firestore, empty sitemap paths)  
- [x] Full redirect map vs new IA  
- [ ] Formal Firestore JSON dump committed under `docs/exports/` (live JSON captured via API in this audit; re-run with Admin SDK credentials if rules block later)  
- [ ] Cloudinary dashboard full folder inventory  

---

## 10. Appendix — repo tree (relevant)

```
yug-mach-web/
  next.config.ts
  next-sitemap.config.js
  package.json
  scripts/fullProductUpload.js
  public/{robots.txt,sitemap.xml,sitemap-0.xml,*.svg}
  src/
    app/
      layout.tsx                 # HARDCODED CANONICAL
      (routes)/page.tsx          # /
      (routes)/blog/page.tsx     # /blog
      (routes)/blog/[slug]/page.tsx
      api/getProducts|getBlogs|submitEnquiry/
      db/firebaseAdmin.ts        # client SDK misnomer
      components/...
      hooks/useProducts|useBlogs|useGallery.ts
    constants/index.ts           # CLOUDINARY + FIREBASE_COLLECTIONS
    data/fallbackProducts.ts
    types/index.ts
```

---

*End of legacy audit. Next Phase 0 deliverable: `docs/plan.md`.*
