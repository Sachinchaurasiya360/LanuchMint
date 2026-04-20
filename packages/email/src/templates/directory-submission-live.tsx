import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface DirectorySubmissionLiveEmailProps {
  firstName: string;
  productName: string;
  directoryName: string;
  listingUrl: string;
  dashboardUrl: string;
}

export function DirectorySubmissionLiveEmail({
  firstName,
  productName,
  directoryName,
  listingUrl,
  dashboardUrl,
}: DirectorySubmissionLiveEmailProps) {
  return (
    <EmailLayout
      preview={`${productName} is now live on ${directoryName}.`}
    >
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>
        {directoryName} approved {productName}, {firstName}.
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        Your submission is live. Listing URL:
      </Text>
      <Text
        style={{
          fontSize: 13,
          lineHeight: "20px",
          color: "#0a0a0a",
          backgroundColor: "#fafafa",
          border: "1px solid #e5e5e5",
          borderRadius: 6,
          padding: "10px 12px",
          wordBreak: "break-all",
        }}
      >
        {listingUrl}
      </Text>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        We'll keep tracking its backlink status and traffic in your directory
        dashboard.
      </Text>
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
        View directory performance
      </Button>
    </EmailLayout>
  );
}
