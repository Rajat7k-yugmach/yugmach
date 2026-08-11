# YugMach (Next.js + Payload CMS)

Public site for [yugmach.com](https://www.yugmach.com) — Next.js App Router with Payload CMS 3 on Neon Postgres, deployed on Vercel.

## Stack

- **Frontend**: Next.js 15 (SSG/ISR)
- **CMS / API**: Payload CMS 3 at `/admin`
- **Database**: Neon Postgres (Vercel Marketplace)
- **Leads**: `/api/v1/leads` (honeypot + optional Upstash rate limit + Resend email)
- **Advisor / PDFs**: `/api/v1/advisor/recommend`, `/api/v1/products/[slug]/spec-sheet.pdf`

## Quick start

```bash
cp .env.example .env.local
# set POSTGRES_URL, PAYLOAD_SECRET
npm install
npm run dev
```

Open:
- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

## Migrate data from Django

With Django Postgres still available locally:

```bash
DJANGO_DATABASE_URL=postgres://localhost:5432/yugmach_dev \
POSTGRES_URL=… \
PAYLOAD_SECRET=… \
npm run migrate:django
```

## Deploy

Push to `main` on GitHub (`Rajat7k-yugmach/yugmach`). Vercel builds automatically once env vars are set:

- `POSTGRES_URL` / `DATABASE_URL` (from Neon integration)
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- Optional: `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
