/** Display helpers for marketing copy. */

/**
 * Normalize AI-style em dashes in titles for public display.
 * CMS data is left unchanged; only presentation is adjusted.
 */
export function displayTitle(text: string): string {
  return text
    .replace(/\s*—\s*/g, " - ")
    .replace(/\s*–\s*/g, " - ")
    .replace(/ {2,}/g, " ")
    .trim();
}
