# YugMach Admin — Field Guide (every collection)

How to use **each sidebar collection**: what it is for, how to create/edit, and **example values** for every important field.

**Admin URL:** [https://frontend-six-kappa-clmd7dlhna.vercel.app/admin](https://frontend-six-kappa-clmd7dlhna.vercel.app/admin)

---

## Golden rules (always)

1. After edits → click **Save**.
2. For public pages, set **Status = published** (draft stays hidden).
3. Hard-refresh the public page: **Cmd + Shift + R**.
4. Do **not** change **Slug** casually — that changes the URL and can break Google links.
5. Prefer **Media upload** for images (not localhost paths).

---

## Quick map

| Sidebar item | What it controls on the website |
|---|---|
| **Products** | `/products` and `/products/{slug}` — machines, price, images, **spec values** |
| **Spec Fields** | Only labels/units for specs (dictionary). Values are on **Product → Specs** |
| **Media** | Image library (uploads to Vercel Blob CDN) |
| **Machine Types** | `/machines/{slug}` — VFFS, auger filler, etc. |
| **Applications** | `/packing-machine/{slug}` — namkeen, masala, powder SEO pages |
| **Industries** | Industry pages / filters |
| **Blog Posts** | `/blog/{slug}` |
| **Blog Categories** | Blog category labels |
| **Faqs** | FAQ blocks on product / application pages |
| **Finder Steps** | Homepage machine finder wizard steps |
| **Case Studies** | Customer story pages |
| **Testimonials** | Review quotes |
| **Locations** | City / local SEO pages |
| **Spare Parts** | Spare parts list |
| **Redirects** | Old URL → new URL (SEO) |
| **Leads** | Enquiries from forms (usually read-only for you) |
| **Contact Channels** | WhatsApp / phone numbers shown on site |
| **Users** | Admin login accounts |
| **Site Settings** (Globals) | Company email, address, GST, hours |

---

# Spec Fields (most important to understand)

## What is Spec Fields?

Think of it as a **dictionary of labels**, not the machine data.

| Where | What you edit |
|---|---|
| **Spec Fields** | “What is this field called?” e.g. key `capacity_pph`, label `Capacity`, unit `pouches/hour` |
| **Products → Specs** | “What is the value for this machine?” e.g. `2400` |

They link by **Key** (exact spelling).

Example:

- Spec Field: `key = capacity_pph`, `label = Capacity`, `unit = pouches/hour`
- Product Specs: `capacity_pph = 2400`
- Website shows: **Capacity: 2400 pouches/hour**

If you only change Spec Fields, numbers on products do **not** change.  
If you only change Product Specs, labels stay the same.

**Day to day:** edit numbers on **Products**. Open **Spec Fields** only when you need a new label, unit, or dropdown option.

---

## Spec Field fields explained

### Key * (required)

- Internal ID used in product JSON.
- Use lowercase + underscores. Never change after products use it.
- Examples: `capacity_pph`, `fill_type`, `power_kw`, `warranty_months`

### Label * (required)

- English name shown on the website.
- Examples: `Capacity`, `Fill type`, `Power`

### Label Hi

- Hindi label (optional). **Not “label height”.**
- Example: `क्षमता`

### Data Type * (required)

| Value | Meaning | Example product value |
|---|---|---|
| **INT** | Whole number | `2400` |
| **DECIMAL** | Decimal number | `3.5` |
| **TEXT** | Free text | `PLC` |
| **BOOL** | Yes/No checkbox | `true` / `false` |
| **ENUM** | Pick from a fixed list | `CUP` |
| **RANGE** | Min–max object (advanced) | `{"min":10,"max":50}` |
| **MULTI** | Multiple values (advanced) | `["A","B"]` |

### Enum Options (only for Data Type = ENUM)

This is the list of allowed choices.

**How to fill it in admin**

1. Set **Data Type** = `ENUM`
2. In **Enum Options**, enter a JSON **array of strings**

Example for fill type:

```json
[
  "AUGER",
  "CUP",
  "MULTI_HEAD",
  "LINEAR_WEIGH",
  "LIQUID",
  "MANUAL"
]
```

**Tips**

- Use double quotes `"CUP"` not single quotes.
- Commas between items.
- Leave empty `[]` if Data Type is not ENUM.
- On the **Product**, you then pick one of these options in Specs.

### Group * (required)

Where the field sits on the product Specs form:

| Group | Use for |
|---|---|
| CAPACITY | Speed / pouches per hour |
| FILL | Auger / cup / multihead |
| POUCH | Pouch size / film |
| SEAL | Seal type |
| POWER | kW / voltage |
| PHYSICAL | Size / weight |
| CONTROL | PLC / HMI |
| COMMERCIAL | Warranty / delivery |

### Display Order

- Sort number inside the group. Lower = higher on the form.
- Example: `10`, `20`, `30`

### Unit

- Shown after the value.
- Examples: `pouches/hour`, `kW`, `mm`, `months`

### Prefix Value / Suffix Value

- Extra text before/after value (optional).
- Example suffix: `±5%`

### Help Text

- Short tip for editors (optional).

### Show In Summary

- If checked, can appear in the product “at a glance” strip.

### Is Filterable / Is Comparable / Is Required

- Filterable: used in filters (when wired).
- Comparable: used on compare views.
- Required: mark important specs (enforcement may be soft).

### Machine Types / Applications

- Optional: limit which products see this field.
- Leave empty = show for all products.

### Is Active

- Uncheck to hide without deleting.

---

## Spec Field — create new (example)

**Goal:** Add “Air consumption” for machines.

| Field | Example value |
|---|---|
| Key | `air_cfm` |
| Label | `Air consumption` |
| Label Hi | (empty or Hindi) |
| Data Type | `DECIMAL` |
| Enum Options | `[]` |
| Group | `POWER` |
| Display Order | `40` |
| Unit | `CFM` |
| Is Active | checked |

Save → open a **Product** → Specs → fill `air_cfm` = `12.5`.

**ENUM example:** Key `fill_type`, Data Type `ENUM`, Enum Options as JSON array above → on Product choose `CUP`.

---

# Blog Posts

## Cover Media vs Cover Image

| Field | What it is | When to use |
|---|---|---|
| **Cover Media** | Upload / pick from Media library (recommended) | Always prefer this |
| **Cover Image** | Text URL/path (legacy) | Auto-filled after you save Cover Media. Or paste a path if needed |
| **Cover Image Alt** | Alt text for SEO | Fill a short description |

**Use case**

1. Click **Cover Media → Create New** (or Choose existing).
2. Upload jpg/png/webp, set Alt on Media, Save media.
3. Back on blog → Cover Media selected → click **Save** on the blog.
4. **Cover Image** fills automatically with the Blob CDN URL. You usually leave it alone.

Do **not** paste `http://localhost...` into Cover Image.

---

## Blog Post fields

| Field | Meaning | Example |
|---|---|---|
| Slug * | URL piece | `auger-vs-cup-filler-packing-machine` → `/blog/auger-vs-cup-filler-packing-machine` |
| Title * | Headline | `Auger filler vs cup filler — which packing machine do you need?` |
| Title Hi | Hindi title | optional |
| Excerpt | Short blurb for cards | `Plain-English comparison for Indian food SMEs…` |
| Excerpt Hi | Hindi excerpt | optional |
| Content * | Full article body | long text / markdown-style paragraphs |
| Content Hi | Hindi body | optional |
| Cover Media | Image upload | pick from Media |
| Cover Image | Legacy URL | auto-filled |
| Cover Image Alt | Image description | `Auger and cup filler machines comparison` |
| Category | Blog category | `Buyer guides` |
| Tags | JSON array of strings | `["comparison","filler","vffs"]` |
| Author Name | Byline | `YugMach` |
| Reading Mins | Minutes | `6` |
| Status * | Visibility | `published` |
| Published At | Date | pick a date |

### Create new blog

1. **Blog Categories** first (if needed) → Create → slug + name → Save.
2. **Blog Posts → Create New**.
3. Fill Title, Slug, Excerpt, Content.
4. Cover Media upload.
5. Category + Tags.
6. Status = **published**, set Published At.
7. Save → open `/blog/{slug}`.

---

# Products

Main collection for machines.

| Field | Meaning | Example |
|---|---|---|
|Slug *|URL|`dhaniya-powder-packing-machine`|
|Name *|Display name|`Dhaniya Powder Packing Machine`|
|Name Hi|Hindi name|optional|
|Short Description|Card text|`2400 PPH cup filler for coriander powder`|
|Description|Long page text|paragraphs|
|Price Paise|Price × 100|`₹2,25,000` → `22500000`|
|Price Unit|Unit label|`Unit`|
|Price Note|Caveat|`GST extra`|
|Machine Type|Link to Machine Types|`VFFS` / cup filler type|
|Applications|Many links|namkeen, powder…|
|Industries|Many links|food, pharma…|
|Related Products|Cross-sell machines|pick 2–4|
|**Specs**|Labeled values (from Spec Fields)|Capacity `2400`, Fill type `CUP`|
|Features|JSON string array|`["SS contact parts","PLC control"]`|
|Use Cases|JSON string array|`["Dhaniya","Haldi powder"]`|
|Images|Gallery rows|Media upload + Alt + Is Primary + Sort Order|
|Videos|YouTube rows|provider `youtube`, videoId `abc123`, title|
|Status *|Visibility|`published`|
|Is Featured|Homepage feature|check sparingly|
|Sort Order|List order|`0`–`500`|
|View Count|Internal counter|usually leave|
|Indiamart Url|External link|IndiaMART URL|
|Legacy Id|Migration id|do not edit|

### Images

1. **Add Image**
2. **Media** → upload or choose existing
3. **Alt** required (SEO)
4. Exactly one **Is Primary**
5. Sort Order `0`, `1`, `2`…
6. Url auto-fills from Media (Blob CDN). Legacy `/machines/{slug}/primary.jpg` still OK.

### Specs on product

Use the labeled Specs UI (not raw JSON). Values must use Spec Field keys.

---

# Media

Image library.

| Field | Meaning | Example |
|---|---|---|
| File upload | The image | jpg / png / webp |
| Alt * | Description | `Dhaniya powder packing machine front view` |

**Create:** Media → Create New → upload → Alt → Save → attach on Product / Blog.

---

# Machine Types

Public pages under `/machines/{slug}`.

| Field | Example |
|---|---|
|Slug *|`vffs-packing-machine`|
|Name *|`VFFS Packing Machine`|
|Name Hi|optional|
|Description|What this machine family is|
|Hero Image|URL or path (optional)|
|Sort Order|`10`|
|Status|`published`|

---

# Applications

SEO pages `/packing-machine/{slug}` (namkeen, masala…). **Different from Machine Types.**

| Field | Example |
|---|---|
|Slug *|`dhaniya-powder`|
|Name *|`Dhaniya powder packing machine`|
|H1 *|Page headline|
|Intro / Body|SEO copy|
|Product Challenges|Buyer pain points|
|Recommended Fill Type|`CUP` / `AUGER` / …|
|Typical Pouch Sizes|JSON array e.g. `["50g","100g","250g"]`|
|Typical Film Types|JSON array|
|Hero Image|URL|
|Sort Order|`10`|
|Status|`published`|

---

# Industries

| Field | Example |
|---|---|
|Slug *|`food-processing`|
|Name *|`Food processing`|
|Description|Industry intro|
|Hero Image|URL|
|Status|`published`|

---

# Blog Categories

| Field | Example |
|---|---|
|Slug *|`buyer-guides`|
|Name *|`Buyer guides`|
|Name Hi|optional|

Create category **before** assigning it on a Blog Post.

---

# Faqs

| Field | Example |
|---|---|
|Question *|`What is the price of this machine?`|
|Answer *|`Published price is … GST extra.`|
|Question Hi / Answer Hi|optional|
|Product|link one product (optional)|
|Application|link one application (optional)|
|Scope|`product` / `application` / `general`|
|Sort Order|`0`|

---

# Finder Steps

Controls homepage **Machine Finder** questions.

| Field | Example |
|---|---|
|Key *|`application`|
|Label *|`What will you pack?`|
|Input Type|`chip` / `select` / `number`|
|Options|JSON list of choices|
|Sort Order|`1`|
|Is Active|checked|

Change carefully — wrong options can break the finder.

---

# Case Studies

| Field | Example |
|---|---|
|Slug *|`namkeen-plant-mathura`|
|Customer Name *|`Sharma Foods`|
|Customer City|`Mathura`|
|Industry|`Snacks`|
|Challenge / Solution / Results *|story paragraphs|
|Metrics|JSON e.g. `{"pph":2400,"payback_months":14}`|
|Video Id|YouTube id|
|Products|related machines|
|Status|`published`|

---

# Testimonials

| Field | Example |
|---|---|
|Customer Name *|`Ramesh Kumar`|
|Company / City|`RK Spices` / `Agra`|
|Rating|`5`|
|Text *|Review quote|
|Product|optional link|
|Source|`direct` / `google`|
|Is Verified / Is Featured|checkboxes|

---

# Locations

Local SEO pages.

| Field | Example |
|---|---|
|Slug *|`mathura`|
|City *|`Mathura`|
|State *|`Uttar Pradesh`|
|H1 *|`Packing machine manufacturers in Mathura`|
|Body *|Local page copy|
|Service Eta|`Same-week demo available`|
|Lat / Lng|optional|
|Status|`published`|

---

# Spare Parts

| Field | Example |
|---|---|
|Slug *|`sealing-jaw-vffs`|
|Name *|`Sealing jaw (VFFS)`|
|SKU|`YM-SJ-01`|
|Description|What it fits|
|Compatible Products|select machines|
|Price Paise|`500000` = ₹5,000|
|Status|`published`|

---

# Redirects

When you must change a URL.

| Field | Example |
|---|---|
|Source *|`/old-machine-page` (must start with `/`)|
|Destination *|`/products/new-slug`|
|Is Permanent|checked = 301|

---

# Leads

Form enquiries. Usually **do not create** — only read / update status.

| Field | Meaning |
|---|---|
|Name / Phone / Email|Contact|
|Message|Enquiry text|
|Status|`NEW` → `CONTACTED` → …|
|Notes|Internal notes|
|UTM / Source Page|Marketing attribution|

---

# Contact Channels

WhatsApp / phone shown on site.

| Field | Example |
|---|---|
|Channel Type *|`whatsapp` or `phone`|
|Label *|`Sales WhatsApp`|
|E164 *|`917500399754` (country code, no +)|
|Display *|`+91 75003 99754`|
|Is Primary|one primary WhatsApp|
|Is Active|checked|

---

# Users

Admin logins only.

| Field | Example |
|---|---|
|Email|`sales@yugmach.com`|
|Password|set a strong password|
|Name|`YugMach Admin`|

---

# Site Settings (Globals)

Not a collection list — one settings document.

| Field | Example |
|---|---|
|Business Hours|`Mon–Sat, 9am–7pm`|
|GSTIN|your GST number|
|Show Gstin|checked|
|Company Email|`sales@yugmach.com`|
|Company Address|Mathura address|

---

## Common mistakes

| Mistake | Fix |
|---|---|
| Editing Spec Fields expecting product numbers to change | Edit **Product → Specs** |
| Thinking **Label Hi** means height | It means **Hindi label** |
| Enum Options as plain text without JSON | Use `["A","B"]` with quotes |
| Filling Cover Image manually with localhost | Use **Cover Media** upload |
| Status left as draft | Set **published** |
| Changing Slug | Keep slug; add a **Redirect** if you must change URL |

---

## Suggested daily workflow

1. **Products** — prices, images, specs, publish  
2. **Blog Posts** — articles + Cover Media  
3. **Media** — upload photos once, reuse  
4. **Spec Fields** — only when adding a new kind of spec  
5. Everything else — as needed for SEO pages / FAQs / redirects  
