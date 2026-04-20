import { ImageResponse } from "next/og";
import { db } from "@launchmint/db";

export const runtime = "nodejs";
export const alt = "LaunchMint product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: { slug: string } }) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    select: { name: true, tagline: true, category: true, slug: true },
  });

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#fafafa",
            fontSize: 48,
            fontFamily: "Inter, sans-serif",
          }}
        >
          LaunchMint
        </div>
      ),
      size,
    );
  }

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
            justifyContent: "space-between",
            color: "#a3a3a3",
            fontSize: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#FACC15",
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: "#FACC15",
                borderRadius: 8,
              }}
            />
            LaunchMint
          </div>
          <span>{product.category}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 80,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 1040,
            }}
          >
            {product.name}
          </div>
          <div
            style={{
              color: "#d4d4d4",
              fontSize: 34,
              fontWeight: 400,
              lineHeight: 1.3,
              maxWidth: 1040,
            }}
          >
            {(product.tagline ?? "").slice(0, 140)}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#FACC15",
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          launchmint.com/products/{product.slug}
        </div>
      </div>
    ),
    size,
  );
}
