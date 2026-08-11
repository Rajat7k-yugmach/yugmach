# Phase plan — yugmach.com rebuild

**Status:** Phase 0 in progress (2026-08-08)  
**Design:** Locked in-house — see `frontend/docs/design-system.md` (ADR-001).

## Phase 0 — Foundation (current)

### Backend (`backend/` → yugmach-backend)
- [ ] Django 5.1 + `config/settings/{base,dev,prod}`
- [ ] `core` app: UUIDModel, enums, health, revalidate client
- [ ] Minimal `catalogue.Product` for one seeded SKU
- [ ] DRF + Spectacular OpenAPI at `/api/schema/`
- [ ] Postgres `yugmach_dev`, Celery eager in dev
- [ ] `/health`, `.env.example`, ruff/black/pytest, Dockerfile shape

### Frontend (`frontend/` → yugmach-web)
- [ ] Next.js 15 App Router, TS strict, Tailwind, design tokens
- [ ] `next-intl` scaffold (`en-IN` root)
- [ ] `/api/revalidate` with constant-time secret check
- [ ] orval wired to Django schema
- [ ] One SSG product page proving price in raw HTML

### Docs
- [x] `docs/legacy-audit.md` (both repos)
- [x] `docs/decisions.md`
- [x] `docs/design-system.md` (frontend)
- [ ] `docs/data-gaps.md`
- [ ] This plan confirmed before Phase 1 catalogue work

**Exit:** Admin login → seed product → orval fetch → SSG page with price in HTML → edit price → revalidate → page updates without rebuild.

## Phase 1 — Catalogue + sheet pipeline
SpecField registry, all catalogue models, import dry-run/commit, seed 37 from CSV, `/products` + `/products/[slug]` + `/compare`, filters via URL params.

## Phase 2 — SEO engine
22 application pages (≥800 words each), machine types, industries, sitemap, JSON-LD, redirects, OG images.

## Phase 3 — Conversion
Machine Finder, quote flow, WhatsApp, subsidy/EMI, leads + SES, GA4.

## Phase 4 — Content & trust
Blog, case studies, gallery, about, contact, locations, legal.

## Phase 5 — Launch
Perf/a11y budgets, cutover, GSC.

## Phase 6 — Hindi mirror  
## Phase 7 — Intelligence (advisor, ROI, dealer, export)

---

**Confirm this plan before Phase 1 catalogue implementation.** Phase 0 scaffolding continues now.
