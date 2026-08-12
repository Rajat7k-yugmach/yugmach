/** Derive public Vercel Blob CDN base from BLOB_READ_WRITE_TOKEN. */
export function vercelBlobBaseUrl(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN || "";
  const storeId = token.match(/^vercel_blob_rw_([a-z\d]+)_/i)?.[1]?.toLowerCase();
  if (!storeId) return null;
  return `https://${storeId}.public.blob.vercel-storage.com`;
}

/**
 * Rewrite Payload's /api/media/file/... URLs to the public Blob CDN URL when possible.
 * Files live on Blob; the /api/media/file proxy often 404s on Vercel.
 */
export function toBlobPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const base = vercelBlobBaseUrl();
  if (!base) return trimmed;

  try {
    const u = trimmed.startsWith("/")
      ? new URL(trimmed, "http://local.invalid")
      : new URL(trimmed);

    // Already a blob CDN URL
    if (u.hostname.endsWith(".blob.vercel-storage.com")) {
      u.search = "";
      return u.toString();
    }

    // /api/media/file/<filename>?prefix=media
    const match = u.pathname.match(/^\/api\/media\/file\/(.+)$/);
    if (match) {
      const filename = decodeURIComponent(match[1]!);
      const prefix = u.searchParams.get("prefix") || "media";
      const encoded = filename.split("/").map(encodeURIComponent).join("/");
      return `${base}/${prefix}/${encoded}`;
    }
  } catch {
    /* keep original */
  }

  return trimmed;
}

/** Turn API absolute media URLs into Next-friendly local paths when possible. */
export function toPublicImageSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Prefer Blob CDN when Payload stored a broken /api/media/file proxy URL
  const viaBlob = toBlobPublicUrl(trimmed);
  if (viaBlob && viaBlob !== trimmed && viaBlob.includes("blob.vercel-storage.com")) {
    return viaBlob;
  }

  // Already a site-relative path
  if (trimmed.startsWith("/")) return trimmed;

  // http://localhost:3000/machines/... → /machines/...
  try {
    const u = new URL(trimmed);
    if (u.hostname.endsWith(".blob.vercel-storage.com")) {
      return trimmed;
    }
    if (
      u.pathname.startsWith("/machines/") ||
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1"
    ) {
      return u.pathname + u.search;
    }
    // Same-origin /api/media/file → blob rewrite already attempted above
    if (u.pathname.startsWith("/api/media/file/")) {
      return toBlobPublicUrl(trimmed) || trimmed;
    }
  } catch {
    /* not a URL */
  }

  // Strip any origin prefix pointing at this frontend for static machine photos
  const stripped = trimmed.replace(/^https?:\/\/[^/]+/, "");
  if (stripped.startsWith("/machines/")) return stripped;

  return viaBlob || trimmed;
}
