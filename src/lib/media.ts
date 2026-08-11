/** Turn API absolute media URLs into Next-friendly local paths when possible. */
export function toPublicImageSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Already a site-relative path
  if (trimmed.startsWith("/")) return trimmed;

  // http://localhost:3000/machines/... → /machines/...
  try {
    const u = new URL(trimmed);
    if (
      u.pathname.startsWith("/machines/") ||
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1"
    ) {
      return u.pathname + u.search;
    }
  } catch {
    /* not a URL */
  }

  // Strip any origin prefix pointing at this frontend
  const stripped = trimmed.replace(/^https?:\/\/[^/]+/, "");
  if (stripped.startsWith("/machines/")) return stripped;

  return trimmed;
}
