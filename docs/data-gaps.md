# Data gaps — client must supply

Do **not** invent specs, prices, certifications, or customer names.

## Blocking / high priority

| Item | Status | Notes |
|---|---|---|
| Full technical specs for all 37 machines | Open | PPH details beyond name, fill range, pouch size, fill type, seal, film, power, air, dims, weight, MOC, controls, warranty |
| `machine_type` + `fill_type` on catalogue CSV | Inferred | Confirm before publish — see CSV `data_confidence` |
| Rusk packing machine price | TBD | Missing on IndiaMART extract |
| Horizontal flow wrap machine price | TBD | Missing on IndiaMART extract |
| Machine videos (one per SKU, real product) | Open | Gates Phase 2 video blocks |
| Primary phone | Open | Site +91 75003 99754 vs IndiaMART +91 80438 02806 |
| Full GST number | Masked | `09**********1ZV` |
| UDYAM full | Masked | `UDYAM-UP-54-****161` |
| Firestore export credentials | Open | Export legacy products/blogs then retire Firebase |
| Cloudinary API credentials | Open | Reorganise to `yugmach/products/<slug>/` |
| Price display policy | Open | Exact vs “from”; GST extra (recommended: exact + “GST extra”) |
| Warranty / AMC tiers / coverage SLA | Open | |
| ISO certificate | Open | **Do not claim ISO until number + issuer supplied** |
| “150+ clients” / “98% satisfaction” | Unsubstantiated | Prefer “35+ models”, “4.9★ / 40 IndiaMART reviews” |
| Case study customer names + permission | Open | |
| Hindi translation approach | Open | Professional / client-written — not raw MT |

## Seed placeholders

Unknown spec fields: store as omitted (`null` not stored); UI shows “Ask on WhatsApp” / hide row. List every omitted field here as filled.
