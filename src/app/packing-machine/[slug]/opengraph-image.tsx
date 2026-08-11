import { ImageResponse } from "next/og";

import { getApplication } from "@/lib/api/catalogue";

export const runtime = "edge";
export const alt = "YugMach packing machine";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  let name = "Packing machine";
  let price = "";
  try {
    const app = await getApplication(slug);
    if (app) {
      name = app.h1 || `${app.name} Packing Machine`;
      price = app.priceMinDisplay ? `From ${app.priceMinDisplay}` : "";
    }
  } catch {
    /* ignore */
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0e161f",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 600, color: "#e8890c" }}>YugMach</div>
        <div
          style={{
            marginTop: 20,
            fontSize: 54,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.15,
            maxWidth: 1000,
          }}
        >
          {name}
        </div>
        <div style={{ marginTop: 24, fontSize: 30, color: "#d0d7de" }}>
          {price || "Published prices · India-wide delivery"}
        </div>
      </div>
    ),
    { ...size },
  );
}
