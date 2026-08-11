import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "YugMach — packing machines with real prices";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 20,
              height: 56,
              background: "#e8890c",
            }}
          />
          <div style={{ fontSize: 72, fontWeight: 700, color: "#ffffff" }}>YugMach</div>
        </div>
        <div style={{ marginTop: 28, fontSize: 34, color: "#e8890c", fontWeight: 600 }}>
          Packing machines with real prices
        </div>
        <div style={{ marginTop: 20, fontSize: 26, color: "#c7ccd4", maxWidth: 900 }}>
          35+ machines for namkeen, masala, powder and snacks. Shipped India-wide.
        </div>
      </div>
    ),
    { ...size },
  );
}
