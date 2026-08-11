import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "YugMach packing machine";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#15202b",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 14, height: 40, background: "#e8890c" }} />
          <div style={{ fontSize: 34, fontWeight: 700, color: "#ffffff" }}>YugMach</div>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 58,
            fontWeight: 700,
            color: "#ffffff",
            maxWidth: 1000,
            lineHeight: 1.15,
          }}
        >
          {name}
        </div>
        <div style={{ marginTop: 28, fontSize: 44, fontWeight: 600, color: "#e8890c" }}>
          Price on request
        </div>
        <div style={{ marginTop: 24, fontSize: 24, color: "#c7ccd4" }}>
          India-wide delivery · GST extra · WhatsApp for a video demo
        </div>
      </div>
    ),
    { ...size },
  );
}
