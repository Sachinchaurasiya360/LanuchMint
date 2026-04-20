import type { ReactElement } from "react";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

interface OgTemplateProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  footer?: string;
}

/**
 * Shared OG image layout so every route type has a consistent visual
 * language. Dark background, yellow accent, Inter-like weights. Rendered
 * via next/og ImageResponse - must stay in inline-style / RN-like subset.
 */
export function ogTemplate(props: OgTemplateProps): ReactElement {
  return (
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
          fontSize: 22,
          color: "#a3a3a3",
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
        <span style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {props.eyebrow}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            color: "#ffffff",
            fontSize: 76,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: 1040,
          }}
        >
          {props.title}
        </div>
        {props.subtitle ? (
          <div
            style={{
              color: "#d4d4d4",
              fontSize: 32,
              fontWeight: 400,
              lineHeight: 1.3,
              maxWidth: 1040,
            }}
          >
            {props.subtitle}
          </div>
        ) : null}
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
        <span style={{ color: "#FACC15" }}>
          {props.footer ?? "Launch · Review · Rank"}
        </span>
      </div>
    </div>
  );
}
