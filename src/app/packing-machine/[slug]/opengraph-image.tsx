import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "YugMach packing machine";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const title = slug
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
          background: "#0e161f",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 600, color: "#e8890c" }}>YugMach</div>
        <div
          style={{
            marginTop: 24,
            fontSize: 56,
            fontWeight: 800,
            color: "#f8fafc",
            lineHeight: 1.1,
            maxWidth: 1000,
          }}
        >
          {title} Packing Machine
        </div>
        <div style={{ marginTop: 28, fontSize: 28, color: "#94a3b8" }}>
          Published prices · India-wide delivery
        </div>
      </div>
    ),
    { ...size },
  );
}
