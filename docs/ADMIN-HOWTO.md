# Admin how-to: Images, Specs, Blogs, Machine Types

Admin URL: `https://frontend-six-kappa-clmd7dlhna.vercel.app/admin`  
(After custom domain: `https://www.yugmach.com/admin`)

Login → left sidebar **Collections**.

---

## Important: how images work

**Recommended:** upload in Admin (Media / product Images → Upload). Files go to **Vercel Blob** (CDN). No GitHub push needed.

**Legacy still works:** site-relative paths like `/machines/{slug}/primary.jpg` under `public/machines/`. Existing products keep working until you replace them.

After **Save**, pages revalidate (usually seconds; hard-refresh if needed).

**SEO:** Page URLs, titles, and HTML stay the same. Only the image `src` URL may change to a Blob CDN URL — that does **not** hurt rankings. Keep good **Alt** text.

---

## 1) Change product images (Admin upload — preferred)

1. Sidebar → **Products** → open the machine  
   (Or upload first under **Media**, then attach it on the product.)
2. Scroll to **Images** → **Add Image** (or edit a row)
3. **Media** → click upload / choose file (jpg/png/webp)
4. Fill **Alt** (short description — required for SEO)
5. **Is Primary** → only one image checked
6. **Sort Order** → `0`, `1`, `2`, …
7. Leave **Url** empty if you uploaded Media (it auto-fills on save). Legacy path still OK if you are not uploading yet.
8. Status = **published** → **Save**

### Where it shows

- `/products/{slug}` gallery + main image  
- Cards on homepage / listings if featured

### One-time setup (developer / Vercel)

Blob storage must be connected to the Vercel project so `BLOB_READ_WRITE_TOKEN` exists. If Upload fails in admin, create a **Blob** store on the YugMach Vercel project (Storage → Blob → Create) and redeploy.

---

## 2) Change product specs

1. Sidebar → **Products** → open the machine
2. Find field **Specs** (JSON)
3. Edit values. Example shape:

```json
{
  "capacity_pph": 2400,
  "fill_type": "CUP",
  "power_kw": 3.5,
  "brand": "Yug Mach"
}
```

4. Keys should match entries in **Spec Fields** (sidebar → Spec Fields) when possible — those control labels/units on the page
5. Also edit if needed:
   - **Features** — JSON array of strings: `["SS contact parts", "PLC control"]`
   - **Use Cases** — same style
6. **Save**

### Optional: change how a spec is labeled

1. Sidebar → **Spec Fields**
2. Open the field (e.g. key `capacity_pph`)
3. Change **Label**, **Unit**, **Group**, **Show In Summary**, etc.
4. **Save**

### Where it shows

- Product page “specs / at a glance” blocks  
- Compare page (if marked comparable)  
- Spec sheet PDF: `/api/v1/products/{slug}/spec-sheet.pdf`

**Price note:** price is **not** inside specs. Use **Price Paise**  
Example: ₹2,25,000 → `22500000` (rupees × 100).

---

## 3) Change blogs

1. Sidebar → **Blog Posts**
2. Open an existing post, or **Create New**
3. Fill:
   - **Title**
   - **Slug** — URL piece, e.g. `auger-vs-cup-filler` → site path `/blog/auger-vs-cup-filler`
   - **Excerpt** — short card text
   - **Content** — full article (plain text / markdown-style text today)
   - **Cover Image** — path like `/machines/.../primary.jpg` or any public path (same URL rules as products)
   - **Cover Image Alt**
   - **Category** — pick from Blog Categories (create category first if needed)
   - **Tags** — JSON array: `["buying-guide"]`
   - **Author Name**, **Reading Mins**
   - **Status** → **published**
   - **Published At** → set a date
4. **Save**

### Categories (optional)

1. Sidebar → **Blog Categories**
2. Create/edit **Name** + **Slug**
3. Then attach that category on the blog post

### Where it shows

- `/blog` list  
- `/blog/{slug}` article  
- Homepage blog teaser (latest posts)

---

## 4) Change Machine Type name + description

1. Sidebar → **Machine Types**
2. Open a type (e.g. Collar Type, Flow Wrap, …)
3. Edit:
   - **Name**
   - **Description** (main text you care about)
   - **Hero Image** — path string, same `/machines/...` style if used
   - **Sort Order** — lower = earlier in lists
   - **Status** → **published**
4. **Do not casually change Slug** if the type is already linked from products/URLs (`/machines/{slug}`)
5. **Save**

### Link a product to a machine type

1. **Products** → open product  
2. Field **Machine Type** → select the type  
3. **Save**

### Where it shows

- `/machines` list  
- `/machines/{slug}` detail  
- Product pages that reference that type

---

## Quick map: admin → website

| Admin sidebar | Website paths |
|---|---|
| Products | `/products`, `/products/{slug}` |
| Machine Types | `/machines`, `/machines/{slug}` |
| Applications | `/packing-machine/{slug}` (SEO pages — separate from machine types) |
| Blog Posts | `/blog`, `/blog/{slug}` |
| Spec Fields | Labels on product pages (not their own public URL) |

---

## Checklist every time you edit

1. Status = **published** (draft will not show on the public site)
2. Click **Save**
3. Open the public URL in a new tab and hard-refresh (`Cmd+Shift+R`)
4. For **new image files**, they must exist under `public/machines/...` and be deployed; only then does the admin URL path work

---

## Why it feels confusing (honest)

| What you expected | What we have today |
|---|---|
| Upload button in admin | Text field for image **path** |
| Auto localhost cleanup | Fix URL to `/machines/...` manually |
| Specs form with labeled boxes | Specs as **JSON** on the product (+ Spec Fields for labels) |

If you want, next step can be: **add real image upload in admin** (Vercel Blob) so you never type URLs or touch `public/machines` by hand.
