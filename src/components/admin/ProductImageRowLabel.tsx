"use client";

import React from "react";
import { useRowLabel } from "@payloadcms/ui";

/**
 * Shows a thumbnail / status in each product Images array row so editors
 * can tell primary vs broken media without a blank skeleton.
 */
export default function ProductImageRowLabel() {
  const { data, rowNumber } = useRowLabel<{
    alt?: string;
    url?: string;
    isPrimary?: boolean;
    media?: string | number | { id?: string | number; url?: string; alt?: string } | null;
  }>();

  const mediaUrl =
    typeof data?.media === "object" && data.media && typeof data.media.url === "string"
      ? data.media.url
      : null;
  const url = mediaUrl || (typeof data?.url === "string" ? data.url : "");
  const alt = data?.alt || (typeof data?.media === "object" ? data.media?.alt : "") || "";
  const hasMediaId =
    data?.media != null &&
    data.media !== "" &&
    !(typeof data.media === "object" && data.media.url);

  let status = "Empty — upload Media or set URL";
  if (url) status = data?.isPrimary ? "Primary image" : "Gallery image";
  else if (hasMediaId) status = "Broken media link — clear Media and re-upload";

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 10 }}
      data-testid={`product-image-row-label-${rowNumber}`}
    >
      <div
        style={{
          width: 48,
          height: 36,
          borderRadius: 4,
          overflow: "hidden",
          background: "var(--theme-elevation-100)",
          border: "1px solid var(--theme-elevation-150)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          color: "var(--theme-elevation-500)",
        }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          "?"
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>
          Image {(rowNumber ?? 0) + 1}
          {data?.isPrimary ? " · Primary" : ""}
        </div>
        <div
          style={{
            fontSize: 12,
            color: hasMediaId && !url ? "var(--theme-error-500)" : "var(--theme-elevation-500)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 360,
          }}
        >
          {alt || status}
        </div>
      </div>
    </div>
  );
}
