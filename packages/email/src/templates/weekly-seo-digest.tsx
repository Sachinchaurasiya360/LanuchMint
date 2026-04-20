import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface WeeklySeoDigestEmailProps {
  firstName: string;
  productName: string;
  impressions: number;
  clicks: number;
  topQuery: string | null;
  topPage: string | null;
  weekEnding: string;
  dashboardUrl: string;
}

export function WeeklySeoDigestEmail({
  firstName,
  productName,
  impressions,
  clicks,
  topQuery,
  topPage,
  weekEnding,
  dashboardUrl,
}: WeeklySeoDigestEmailProps) {
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0.0";
  return (
    <EmailLayout
      preview={`${productName}: ${impressions.toLocaleString()} impressions, ${clicks.toLocaleString()} clicks this week.`}
    >
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>
        Your {productName} SEO week, {firstName}.
      </Heading>
      <Text style={{ fontSize: 13, color: "#737373", margin: "0 0 16px" }}>
        Week ending {weekEnding}
      </Text>
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        style={{
          width: "100%",
          borderCollapse: "collapse",
          margin: "8px 0 20px",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                border: "1px solid #e5e5e5",
                padding: 12,
                width: "50%",
              }}
            >
              <Text style={{ fontSize: 11, color: "#737373", margin: 0 }}>
                Impressions
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#0a0a0a",
                  margin: "4px 0 0",
                }}
              >
                {impressions.toLocaleString()}
              </Text>
            </td>
            <td
              style={{
                border: "1px solid #e5e5e5",
                padding: 12,
                width: "50%",
              }}
            >
              <Text style={{ fontSize: 11, color: "#737373", margin: 0 }}>
                Clicks · CTR
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#0a0a0a",
                  margin: "4px 0 0",
                }}
              >
                {clicks.toLocaleString()} · {ctr}%
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
      {topQuery ? (
        <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
          Top query: <strong>{topQuery}</strong>
        </Text>
      ) : null}
      {topPage ? (
        <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
          Top page: <strong>{topPage}</strong>
        </Text>
      ) : null}
      <Button
        href={dashboardUrl}
        style={{
          backgroundColor: "#FACC15",
          color: "#0a0a0a",
          padding: "12px 20px",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 14,
          textDecoration: "none",
          display: "inline-block",
          marginTop: 12,
        }}
      >
        Open SEO dashboard
      </Button>
    </EmailLayout>
  );
}
