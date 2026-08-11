# YugMach Frontend (Next.js)

Public site for [yugmach.com](https://www.yugmach.com) — SSG/ISR over the Django API.

## Design

In-house industrial system (charcoal + safety amber). See `docs/design-system.md`.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Requires Django API on `DJANGO_API_URL` (default `http://127.0.0.1:8000`).

## Phase 0 acceptance

```bash
curl -s http://localhost:3000/products/2400-pph-namkeen-packing-machine | grep -c '2,25,000'
# must be ≥ 1
```
