import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface LaunchLiveEmailProps {
  firstName: string;
  productName: string;
  productUrl: string;
  leaderboardUrl: string;
}

export function LaunchLiveEmail({
  firstName,
  productName,
  productUrl,
  leaderboardUrl,
}: LaunchLiveEmailProps) {
  return (
    <EmailLayout preview={`${productName} is live on LaunchMint.`}>
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>
        {firstName}, {productName} is live.
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        Your launch page is on the leaderboard for the next 24 hours. Time
        spent in the comments converts upvotes — be present.
      </Text>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        Cross-post to X, LinkedIn, Show HN, and Indie Hackers in the next hour
        for the strongest signal.
      </Text>
      <Button
        href={productUrl}
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
          marginRight: 8,
        }}
      >
        View product page
      </Button>
      <Button
        href={leaderboardUrl}
        style={{
          backgroundColor: "#ffffff",
          color: "#0a0a0a",
          padding: "12px 20px",
          borderRadius: 8,
          border: "1px solid #e5e5e5",
          fontWeight: 600,
          fontSize: 14,
          textDecoration: "none",
          display: "inline-block",
          marginTop: 12,
        }}
      >
        Today's leaderboard
      </Button>
    </EmailLayout>
  );
}
