# YugMach Admin Guide

How to update **product images**, **specs**, **blogs**, and **machine types** from the website admin — no coding required.

**Full field-by-field guide (every collection):** [ADMIN-FIELD-GUIDE.md](./ADMIN-FIELD-GUIDE.md)  
→ Start there if you are unsure what **Key / Label / Label Hi / Enum Options**, or **Cover Media vs Cover Image**, mean.

---

## Before you start

### 1. Open admin

**Admin URL:** [https://frontend-six-kappa-clmd7dlhna.vercel.app/admin](https://frontend-six-kappa-clmd7dlhna.vercel.app/admin)

(Later, with custom domain: `https://www.yugmach.com/admin`)

### 2. Log in

Use your admin email and password.

### 3. Find Collections

After login, you land on **Products** (the main list). Use the **left sidebar** for everything else: Media, Blog Posts, Machine Types, Spec Fields, etc.

The old “Dashboard” page is not used — it redirected here on purpose so you don’t see a blank screen.

### 4. Golden rules (every edit)

1. Set **Status** to **published** (drafts do **not** appear on the public site).
2. Click **Save** at the top / bottom of the form.
3. Open the public page in a new tab and hard-refresh: **Cmd + Shift + R** (Mac) or **Ctrl + Shift + R** (Windows).
4. Wait a few seconds if the page looks old — the site refreshes cache after save.

### 5. SEO (safe to edit from admin)

| Safe to change | Be careful |
|---|---|
| Names, descriptions, specs, blog content, images, alt text | **Slug** — this is the URL. Changing it can break old Google links unless you add a redirect. |
| Image uploads (Blob CDN) | Does **not** hurt SEO if alt text stays good. Page URLs stay the same. |

---

## Quick map: what edits which page

| In admin (sidebar) | On the website |
|---|---|
| **Products** | `/products` and `/products/{slug}` |
| **Machine Types** | `/machines` and `/machines/{slug}` |
| **Blog Posts** | `/blog` and `/blog/{slug}` |
| **Spec Fields** | Labels/units only (not the numbers). Edit **values** on each **Product → Specs** |
| **Media** | Image library used by products (and other uploads) |
| **Applications** | `/packing-machine/{slug}` (SEO landing pages — different from Machine Types) |

### Live product preview

When you open a **Product**, Payload shows a **Live Preview** panel (split screen) with the real `/products/{slug}` page. Use the Preview toggle in the document header if it is hidden. Click **Refresh** / re-save after edits.

---

## 1. Update product images

Use this when you want new or better photos for a machine.

### Recommended way (Upload in admin)

1. Sidebar → **Products**.
2. Search / open the machine (e.g. by name).
3. Scroll to **Images**.
4. Click **Add Image** (or open an existing image row).
5. In the **Media** field:
   - Click to **upload** a new file, **or**
   - Pick an image already in **Media**.
6. Allowed types: **jpg / jpeg / png / webp**. Prefer clear photos under ~10 MB.
7. Fill **Alt** — short description for Google and accessibility  
   Example: `2400 PPH namkeen packing machine front view`
8. Check **Is Primary** on **only one** image (the main photo on cards and product page).
9. Set **Sort Order**: `0` for primary, then `1`, `2`, `3` for gallery order.
10. Leave **Url** empty when using Media upload — it fills automatically on save.
11. Confirm **Status** = **published**.
12. Click **Save**.
13. Open `/products/{that-product-slug}` and hard-refresh to confirm.

### Optional: upload into Media first

Useful if you will reuse the same photo on more than one place:

1. Sidebar → **Media** → **Create New**.
2. Upload the file.
3. Fill **Alt**.
4. **Save**.
5. Open the product → **Images** → choose that Media item.

### Replace an old image

1. Open the product → **Images**.
2. On that row, upload/select a new **Media** file (or clear and add a new row).
3. Keep **Alt** accurate.
4. **Save**.

### Legacy path (only if needed)

Older products may still use a path like:

```text
/machines/2400-pph-namkeen-packing-machine/primary.jpg
```

That still works. Prefer **Media upload** for all new photos. Do **not** use `http://localhost:...` URLs.

### Where images appear

- Product page gallery: `/products/{slug}`
- Listing / homepage cards (if the product is featured)

---

## 2. Update product specs

**How Spec Fields relate to Products**

- **Spec Fields** = the dictionary (key, label, unit, group). Example: key `capacity_pph`, label `Capacity`, unit `PPH`.
- **Product → Specs** = the values for that machine (`capacity_pph: 2400`).
- They are linked by **key name**, not a dropdown. Edit values on the product; edit labels in Spec Fields.

### Edit values on a product (recommended)

1. Sidebar → **Products** → open the machine.
2. Find **Specs** — labeled inputs grouped by Capacity / Filling / Power / etc. (not raw JSON).
3. Change the numbers/text you need.
4. **Save**.
5. Check the product page (Live Preview or `/products/{slug}`).

### Change how a spec is labeled (unit / group / display name)

1. Sidebar → **Spec Fields**.
2. Open the field (example key: `capacity_pph`).
3. Edit **Label**, **Unit**, **Group**, **Show In Summary**, etc.
4. **Save**.

This does not change the raw numbers on products — only how they are shown.

### Price (not inside Specs)

1. On the product, find **Price Paise**.
2. Convert rupees × 100.  
   Example: ₹2,25,000 → `22500000`
3. Optionally set **Price Unit** (e.g. `Unit`) and **Price Note**.
4. **Save**.

### Where specs appear

- Product page “at a glance” / specs blocks
- Compare views (when marked comparable)
- Spec sheet PDF

---

## 3. Update blogs

### Edit or create a post

1. Sidebar → **Blog Posts**.
2. Open an existing post, **or** click **Create New**.
3. Fill these fields:

| Field | What to enter |
|---|---|
| **Title** | Article headline |
| **Slug** | URL piece only, e.g. `auger-vs-cup-filler` → page `/blog/auger-vs-cup-filler` |
| **Excerpt** | Short blurb for cards / list |
| **Content** | Full article body |
| **Cover Media** | Upload or pick from Media (recommended) |
| **Cover Image** | Auto-filled from Cover Media (legacy URL/path still OK) |
| **Cover Image Alt** | Short description of the cover |
| **Category** | Pick from Blog Categories |
| **Tags** | JSON array, e.g. `["buying-guide"]` |
| **Author Name** | e.g. `YugMach` |
| **Reading Mins** | e.g. `5` |
| **Status** | **published** |
| **Published At** | Set the publish date |

4. Click **Save**.
5. Open `/blog/{slug}` and hard-refresh.

### Create a blog category first (if needed)

1. Sidebar → **Blog Categories**.
2. **Create New**.
3. Set **Name** and **Slug**.
4. **Save**.
5. Go back to the blog post and select that category.

### Where blogs appear

- List: `/blog`
- Article: `/blog/{slug}`
- Homepage teaser (latest published posts)

### SEO tip for blogs

- Prefer a clear, keyword-aware **Title** and **Slug** once, then leave the slug alone.
- Keep **Excerpt** and **Cover Image Alt** filled.

---

## 4. Update machine types (name + description)

Machine types are pages like Collar Type, Flow Wrap, etc. under `/machines/...`.

### Edit a machine type

1. Sidebar → **Machine Types**.
2. Open the type you want.
3. Edit:
   - **Name** — display title
   - **Description** — main explanation text
   - **Hero Image** — path / image URL if used
   - **Sort Order** — lower number = earlier in lists
   - **Status** → **published**
4. **Do not casually change Slug** if products or Google already use `/machines/{slug}`.
5. **Save**.
6. Check `/machines/{slug}`.

### Link a product to a machine type

1. Sidebar → **Products** → open the product.
2. Field **Machine Type** → select the type.
3. **Save**.

### Where machine types appear

- `/machines` list
- `/machines/{slug}` detail
- Product pages that reference that type

---

## Common tasks (cheat sheet)

| I want to… | Go to… | Main action |
|---|---|---|
| Change machine photos | **Products** → Images → **Media** | Upload + Alt + Is Primary → Save |
| Change capacity / power / etc. | **Products** → Specs | Edit labeled fields → Save |
| Change “Capacity (PPH)” label | **Spec Fields** | Edit Label / Unit → Save |
| Change price | **Products** → Price Paise | Rupees × 100 → Save |
| Write / edit an article | **Blog Posts** | Edit fields → Status published → Save |
| Rename a machine category page | **Machine Types** | Edit Name / Description → Save |
| Hide something temporarily | Same collection | Status = **draft** or **archived** → Save |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **“You are not allowed to perform this action”** | Session cookie missing on save. Log out → log in again on the **same** admin URL. Do not mix `www.yugmach.com` and `*.vercel.app`. Hard-refresh after login. |
| **“Failed to fetch”** on Media save | Blob storage or wrong API host. Developer: confirm `BLOB_READ_WRITE_TOKEN` and `PAYLOAD_SERVER_URL` match the admin host. |
| Grey **skeleton** on product image | Broken Media link or API failed to load Media. Clear the Media field on that row → **Add Image** / re-upload → Save. |
| Changes not on the website | Confirm **published**, click **Save**, hard-refresh. Wait ~10–30 seconds. |
| Upload fails | Check file type (jpg/png/webp) and size. Retry. If still failing, tell the developer (Blob token / storage). |
| Image blank / broken | Re-open product Images, confirm Media is selected or Url is a valid path (not localhost). |
| Specs look unlabeled | Add/match the key in **Spec Fields**. |
| Wrong page URL after rename | You likely changed **Slug**. Prefer keeping slug; ask for a redirect if you must change it. |
| Draft still visible? | Hard-refresh / wait for cache. Confirm you edited the correct item. |

---

## Do / Don’t

**Do**

- Use **Media upload** for product images
- Write clear **Alt** text
- Keep **Status = published** for live content
- Leave existing **slugs** alone when possible

**Don’t**

- Paste `http://localhost:3000/...` as an image URL
- Change slugs casually (SEO / bookmarks break)
- Forget to click **Save**
- Mark more than one image as primary

---

## Need help?

If something in admin is missing, upload fails repeatedly, or a public page does not update after save, share:

1. What you tried to edit (product / blog / machine type name)
2. Screenshot of the admin field
3. The public URL you checked

A developer can then check cache, Blob storage, or redirects.
