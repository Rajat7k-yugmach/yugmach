# YugMach — Agent Context (complete handoff)

> **Purpose:** Paste or `@`-attach this file at the start of any new chat so the agent has full project context without relying on prior conversation memory.
>
> **Last updated:** 2026-08-11  
> **Canonical live app:** Next.js + Payload CMS on Vercel + Neon (Django retired from the live request path)

---

## 1. What YugMach is

YugMach sells industrial **packing machines** in India (Mathura-based). The product is a high-SEO marketing site with:

- Published machine prices (differentiator vs IndiaMART)
- Application SEO pages (`/packing-machine/masala`, namkeen, etc.)
- Machine finder, advisor, quote/lead forms, WhatsApp CTAs
- Blog, case studies, testimonials, locations, spares, service pages

**Primary business goal:** rank for packing-machine queries; convert to WhatsApp / lead form.

---

## 2. Accounts, repos, hosting (critical)

| Thing | Value |
|---|---|
| **GitHub account (live)** | `Rajat7k-yugmach` |
| **GitHub repo** | https://github.com/Rajat7k-yugmach/yugmach |
| **Default branch** | `main` |
| **Local frontend path** | `/Users/rajatkaushik/YugMach Projects/frontend` |
| **Local backend path (legacy Django)** | `/Users/rajatkaushik/YugMach Projects/backend` |
| **Vercel team / scope** | `rajat7k-yugmach-admin` |
| **Vercel project name** | `frontend` |
| **Vercel project id** | `prj_YkQJL9wF1S2MZztzm1j89r1Wpj52` |
| **Vercel org id** | `team_yFrnE3RrA1A4V2955mD1ekEd` |
| **Production URL (Vercel alias)** | https://frontend-six-kappa-clmd7dlhna.vercel.app |
| **Deployment example** | https://frontend-db688f7gs-rajat7k-yugmach-admin.vercel.app |
| **Custom domain goal** | `https://www.yugmach.com` (set `NEXT_PUBLIC_SITE_URL` accordingly when DNS is wired) |
| **Neon resource name** | `yugmach-db` (Vercel Marketplace, free_v3, region `sin1` / Singapore) |
| **Payload admin** | `{site}/admin` |
| **Admin email** | `sales@yugmach.com` |
| **Admin password** | Set at cutover to `YugMach-Admin-2026!` — **user must change after first login**; do not assume it forever |
| **Personal GitHub (old)** | `rajat7k` — still on machine keyring as inactive; live work uses `Rajat7k-yugmach` |
| **WhatsApp sales** | `917500399754` |
| **Lead notify email** | `sales@yugmach.com` |

### CLI notes

- `gh` should be logged in as `Rajat7k-yugmach` for pushes to the live repo.
- That account’s token may lack `workflow` scope → pushing `.github/workflows/*` can be rejected. Keep CI out of pushes or re-auth with `workflow` scope.
- `vercel` CLI is installed and linked from the frontend directory (`.vercel/project.json`).
- Neon was installed via: `vercel integration add neon --plan free_v3 -n yugmach-db -m region=sin1 -m auth=false`

---

## 3. Architecture (current — “complete Vercel”)

```
Browser / Googlebot
        │
        ▼
┌───────────────────────────────────────────┐
│  Vercel: ONE Next.js app                  │
│  - Public pages (SSG/ISR HTML cache)      │
│  - Payload CMS at /admin                  │
│  - Route handlers /api/v1/*               │
│  - Middleware redirects (Neon edge read)  │
└───────────────┬───────────────────────────┘
                │
                ▼
        Neon Postgres (yugmach-db)
```

### Core idea (SEO)

- Rankings come from **pre-rendered HTML on Vercel**, not from which CMS wrote the data.
- Visitors on marketing pages mostly get **cached HTML** (built/revalidated from Neon).
- They do **not** hit Django. Django is legacy / local-only source that was migrated once.

### Data flow

1. Editor changes content in **Payload `/admin`** → writes **Neon**.
2. Collection hooks call `revalidateTag(...)` → Vercel refreshes cached pages.
3. Public pages read via **Payload Local API** (`getPayload()` → `payload.find(...)`) in server code only.
4. Lead forms `POST /api/v1/leads` → write Lead in Neon (+ optional Resend email).

### What is NOT true

- Public pages do **not** live-query the entire DB on every click for SSG pages.
- Admin options (users, specs, FAQs, etc.) existing in `/admin` does **not** mean every request loads all collections.

---

## 4. Stack versions & packages

- **Next.js** `16.3.0` (pinned; Payload peer range excludes Next 15.5.x)
- **React** 19.1
- **Payload CMS** `3.87.1`
- **DB adapter:** `@payloadcms/db-vercel-postgres`
- **Editor:** `@payloadcms/richtext-lexical`
- Also: `@neondatabase/serverless` (middleware redirects), `@upstash/ratelimit` + redis (optional lead throttle), `resend` (optional lead email), `@react-pdf/renderer` (spec sheets)
- **Patch:** `patches/payload+3.87.1.patch` (fixes `@next/env` loadEnv under tsx) — applied via `postinstall: patch-package`

---

## 5. Important local paths

```
/Users/rajatkaushik/YugMach Projects/
├── frontend/                          ← LIVE repo (GitHub yugmach)
│   ├── src/payload.config.ts          ← Payload root config
│   ├── src/collections/*              ← 17 collections
│   ├── src/globals/SiteSettings.ts
│   ├── src/lib/payload/getPayload.ts  ← server-only Payload client
│   ├── src/lib/api/catalogue.ts       ← server-only data accessors (stable API for pages)
│   ├── src/lib/api/getSiteSettings.ts ← server-only
│   ├── src/lib/api/siteSettings.ts    ← client-safe types/helpers ONLY
│   ├── src/lib/api/leads.ts           ← client-safe submitLead
│   ├── src/middleware.ts              ← redirects via Neon (not Django)
│   ├── src/app/(payload)/admin/...    ← Payload admin UI routes
│   ├── src/app/api/v1/leads/          ← public lead API
│   ├── src/app/api/v1/advisor/recommend/
│   ├── src/app/api/v1/products/.../spec-sheet.pdf/
│   ├── scripts/migrate-from-django.ts ← one-time ETL Django → Payload
│   ├── scripts/create-admin.ts
│   ├── scripts/restore-to-neon.sh
│   ├── scripts/yugmach-payload.sql    ← dump (gitignored) for Neon restore
│   └── docs/AGENT-CONTEXT.md          ← THIS FILE
├── backend/                           ← LEGACY Django (local Postgres yugmach_dev)
└── BACKEND-DECISION.md                ← earlier SEO decision doc (hybrid Django vs Vercel)
```

Workspace in Cursor often opens **both** `backend` and `frontend` folders.

---

## 6. Payload collections & globals

Collections (all under `src/collections/`):

| Slug | Role |
|---|---|
| `users` | Admin auth |
| `machine-types` | Taxonomy |
| `applications` | SEO application pages |
| `industries` | Industry pages |
| `spec-fields` | Spec registry |
| `products` | Machines (prices in **paise**, images as URL array pointing at `/machines/...` static files) |
| `faqs` | Product/application FAQs |
| `finder-steps` | Machine finder UI steps |
| `blog-categories` / `blog-posts` | Blog |
| `case-studies` | Case studies |
| `testimonials` | Reviews |
| `locations` | City service pages |
| `spare-parts` | Spares catalogue |
| `redirects` | SEO redirects |
| `leads` | Enquiries (admin inbox) |
| `contact-channels` | WhatsApp / phone |

Global: `site-settings` (hours, GSTIN, email, address).

**Status values:** `draft` | `published` | `archived` (Django had `DRAFT`/`PUBLISHED`; migration maps to lowercase).

**Public site only shows `published`** (via `authenticatedOrPublished` access + catalogue filters).

---

## 7. How public pages get data

Pages import stable helpers from `@/lib/api/catalogue` (and thin wrappers like `products.ts`, `blog.ts`):

- `getProducts`, `getProduct`, `getApplications`, `getApplication`, …
- These use Payload Local API with `overrideAccess: true` and `status = published`.
- **Must stay server-only** (`import "server-only"` in `catalogue.ts` / `getPayload.ts`). Never import catalogue into client components — use `import type` for types, or `@/lib/api/leads` for `submitLead`.

Client interactive pages:

- Machine finder → same-origin `/api/v1/products`, `/api/v1/applications`, `/api/v1/finder-steps`
- Advisor → `POST /api/v1/advisor/recommend`
- LeadForm / quote → `POST /api/v1/leads` via `submitLead` in `leads.ts`

Images: mostly static files under `frontend/public/machines/{slug}/...`. Product image URLs in DB are paths like `/machines/...` (helper `toPublicImageSrc` in `src/lib/media.ts`).

---

## 8. Caching / latency / SEO (agent must not regress this)

| Surface | Behavior |
|---|---|
| Product / application / blog / etc. | SSG/ISR HTML on Vercel; DB used at build/revalidate |
| After admin save | `revalidateTag` in collection hooks (dynamic-imported from `@/lib/payload/revalidate`) |
| Leads POST | Live write to Neon |
| Advisor / finder APIs | Live read |
| Middleware redirects | Neon SQL via `@neondatabase/serverless`, ~5 min in-memory cache |
| `/admin` | Live; not an SEO surface |

**SEO rule:** keep indexable content in server-rendered HTML. Do not move product prices/specs behind client-only fetches.

Older design doc: `/Users/rajatkaushik/YugMach Projects/BACKEND-DECISION.md` argued “Django as build-time compiler.” Product decision later: **full Vercel + Payload** for infra consolidation; SEO model still “HTML on the edge,” just with Neon instead of Django.

---

## 9. Environment variables

### Production (Vercel project `frontend`)

Set / injected:

- `POSTGRES_URL`, `DATABASE_URL`, `POSTGRES_URL_NON_POOLING`, plus Neon `PG*` vars (from Marketplace)
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SITE_URL` (currently production value may still be `https://www.yugmach.com` — confirm against actual live host)
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `LEAD_NOTIFY_EMAIL`
- Optional: `RESEND_API_KEY`, `LEAD_FROM_EMAIL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `REVALIDATE_SECRET`

### Local

- `.env.local` / `.env.production.local` (gitignored) — pull with `vercel env pull`
- `.env.example` documents names
- Local Postgres DBs used during migration:
  - `yugmach_dev` — Django source
  - `yugmach_payload` — local Payload target (optional after Neon cutover)

**Never commit secrets.** Prefer `vercel env pull` over pasting connection strings into chat logs.

---

## 10. Migration history (Django → Payload)

1. Django lived in `backend/` with local DB `yugmach_dev` (~57 products, 24 applications, 374 images on disk, 32 redirects, etc.).
2. Script: `npm run migrate:django` → `scripts/migrate-from-django.ts` (needs `DJANGO_DATABASE_URL` + `POSTGRES_URL` + `PAYLOAD_SECRET`).
3. Dump: `scripts/yugmach-payload.sql` (gitignored).
4. Neon restore: `DATABASE_URL=… ./scripts/restore-to-neon.sh` or `psql $POSTGRES_URL_NON_POOLING -f scripts/yugmach-payload.sql`.
5. Admin user: `scripts/create-admin.ts`.

Django is **no longer** required for the live site. Keep the backend folder for reference / re-export only unless someone explicitly revives it.

---

## 11. Product / UX decisions already made (do not silently undo)

- Frontend deploys on **Vercel**; backend path is **Payload + Neon**, not Django on AWS.
- **EMI calculator** removed from nav; `/finance/emi-calculator` and subsidy routes redirect to **ROI calculator**.
- **Hindi** (`/hi` nav link) removed from header/footer emphasis; some `/hi/*` routes may still exist.
- Homepage: hero with copy + mosaic left, **Find your machine** card right; category marquee; blog teaser restored.
- Machine finder: soft ranking / related results — **never** tell the user “showing similar”; don’t show empty zero-result dead ends when related machines exist.
- Reviews: avoid overly specific IndiaMART one-liners that name a single product awkwardly.
- Brand / design: industrial charcoal + amber; follow existing design system in `docs/design-system.md`. Frontend design user rules apply for new UI work.

---

## 12. npm scripts

```bash
npm run dev              # next dev --turbopack
npm run build            # next build --turbopack
npm run payload          # Payload CLI
npm run migrate:django   # one-time ETL
npm run generate:types
npm run generate:importmap
```

Admin bootstrap:

```bash
ADMIN_EMAIL=sales@yugmach.com ADMIN_PASSWORD='…' \
POSTGRES_URL=… PAYLOAD_SECRET=… \
npx tsx scripts/create-admin.ts
```

---

## 13. Deploy / ops cheatsheet

```bash
cd "/Users/rajatkaushik/YugMach Projects/frontend"
gh auth status                    # expect Rajat7k-yugmach
vercel whoami                     # expect rajat7k-yugmach scope
vercel env ls
vercel --prod                     # production deploy
vercel ls                         # recent deployments
```

GitHub → Vercel auto-deploys on push to `main` (project connected to `Rajat7k-yugmach/yugmach`).

If build fails with `ECONNREFUSED 127.0.0.1:5432`, production is missing Neon `POSTGRES_URL` / `DATABASE_URL`.

If build fails pulling Payload into client bundles, a client component imported server-only modules — keep `catalogue` / `getPayload` / `getSiteSettings` server-only; use `leads.ts` + `siteSettings.ts` helpers on the client.

---

## 14. Related docs (secondary)

| File | Use |
|---|---|
| `docs/AGENT-CONTEXT.md` | **This handoff — prefer this** |
| `BACKEND-DECISION.md` (parent folder) | SEO tier analysis; hybrid Django recommendation (superseded for hosting by full Vercel decision) |
| `docs/design-system.md` | Visual system |
| `docs/legacy-audit.md` | Old URL / redirect archaeology |
| `docs/plan.md` / `docs/decisions.md` | Early phase ADRs (partially outdated) |

---

## 15. Open / follow-up items (as of cutover)

- [ ] Change Payload admin password after first login
- [ ] Wire custom domain `www.yugmach.com` to the Vercel project; align `NEXT_PUBLIC_SITE_URL`
- [ ] Optional: Upstash + Resend for lead rate-limit / email in production
- [ ] Optional: isolate `/admin` from public SiteHeader/SiteFooter (admin currently can show inside site chrome — visual oddity only, not SEO)
- [ ] Re-enable GitHub Actions workflow with `workflow` scope on `Rajat7k-yugmach` if desired
- [ ] Django `backend/` decommission when confident (local only today)

---

## 16. Instructions for a new agent session

When this file is attached:

1. Treat **`frontend/` + GitHub `Rajat7k-yugmach/yugmach` + Vercel `frontend` + Neon `yugmach-db`** as the live system.
2. Do **not** reintroduce Django as a runtime dependency for the public site.
3. Do **not** break SSG/ISR by converting catalogue pages to client-side DB fetching.
4. Prefer editing Payload collections / `src/lib/api/catalogue.ts` / Next routes over inventing a second CMS.
5. Ask before destructive DB ops, force-push, or deleting the Django backend folder.
6. For deploys: push to `main` or `vercel --prod` from `frontend/`.
7. Secrets live in Vercel env / local `.env*` — never commit them.

---

## 17. One-sentence summary

**YugMach is a Next.js marketing site on Vercel whose content and leads live in Neon Postgres, edited through Payload at `/admin`, with public pages served as cached HTML for SEO — Django was migrated away and is not part of the live request path.**
