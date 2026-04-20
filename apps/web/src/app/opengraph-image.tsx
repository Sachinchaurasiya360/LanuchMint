import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LaunchMint - Turn visibility into velocity.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: "72px 80px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#FACC15",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: "#FACC15",
              borderRadius: 10,
            }}
          />
          LaunchMint
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 76,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            Turn visibility into velocity.
          </div>
          <div
            style={{
              color: "#a3a3a3",
              fontSize: 30,
              fontWeight: 400,
              lineHeight: 1.3,
              maxWidth: 900,
            }}
          >
            SEO-first launch, review, and growth for indie founders.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#737373",
            fontSize: 22,
          }}
        >
          <span>launchmint.com</span>
          <span style={{ color: "#FACC15" }}>Launch · Review · Rank</span>
        </div>
      </div>
    ),
    size,
  );
}
