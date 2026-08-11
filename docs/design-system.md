# YugMach Design System

**Decision:** Designed in-house for this rebuild. Does **not** depend on `YUGMACH-Design-Prompt.md` stage output. See `backend/docs/decisions.md` ADR-001.

## Direction

Industrial, confident, information-dense but calm. Machines and numbers are the heroes. Built for a factory owner on a mid-range Android phone on patchy 4G — not for a SaaS landing page.

**Brand idea:** *Machines that show up.*

## Colour

| Token | Hex | Use |
|---|---|---|
| `--color-ink` | `#15202B` | Primary text, headers, chrome |
| `--color-ink-muted` | `#3D4A5C` | Secondary text |
| `--color-steel` | `#243447` | Nav, dark surfaces |
| `--color-surface` | `#F7F5F2` | Page background (warm, not cream-cliché) |
| `--color-surface-raised` | `#FFFFFF` | Cards only when interaction needs a container |
| `--color-border` | `#D6D0C8` | Hairlines, table rules |
| `--color-amber` | `#E8890C` | Primary CTA (safety amber — unmissable outdoors) |
| `--color-amber-ink` | `#1A1208` | Text on amber (≥4.5:1) |
| `--color-whatsapp` | `#128C7E` | WhatsApp accent only |
| `--color-price` | `#0B3D2E` | Price numerals (deep industrial green) |
| `--color-success` | `#1B7F4E` | Success |
| `--color-warning` | `#B45309` | Warning |
| `--color-error` | `#B91C1C` | Error |
| `--color-info` | `#1D4E89` | Info |

Avoid: purple/indigo SaaS gradients, terracotta-on-cream, broadsheet newspaper look, glow effects, rounded-full pill clusters.

## Typography

| Role | Family | Notes |
|---|---|---|
| Display / H1–H2 | **Sora** | Geometric, strong numerals, industrial |
| Body / UI | **IBM Plex Sans** | Highly legible; excellent tabular nums for prices |
| Hindi / Devanagari | **Noto Sans Devanagari** | Full companion, not bolted-on |

Scale (px): 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60.  
Body minimum 16px desktop, 17–18px mobile.  
`font-variant-numeric: tabular-nums` on all prices and spec tables.

## Spacing & shape

- 4px base scale
- Radius: 4 / 8 / 12 only (machinery, not consumer app)
- Shadows: one subtle level max
- Breakpoints: 375 / 640 / 768 / 1024 / 1280 / 1536 — **mobile-first at 375**

## UX non-negotiables

1. Price visible above the fold on product and application pages
2. WhatsApp is primary CTA; sticky mobile bar: WhatsApp · Call · Get Quote
3. Video is a first-class block, not a buried tab
4. Machine Finder: product → PPH → pouch size → budget → crawlable `/products?...` results
5. No outbound IndiaMART in nav/hero/contact — one footer social-proof link only
6. `prefers-reduced-motion` respected; touch targets ≥44×44

## Imagery

Real machine / factory photos only (Cloudinary `dab2jnv1e`). No stock photography. Consistent 4:3 or 16:9 crops.
