import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface ReviewReceivedEmailProps {
  founderFirstName: string;
  productName: string;
  reviewerName: string;
  rating: number;
  excerpt: string;
  replyUrl: string;
  isVerified: boolean;
}

export function ReviewReceivedEmail({
  founderFirstName,
  productName,
  reviewerName,
  rating,
  excerpt,
  replyUrl,
  isVerified,
}: ReviewReceivedEmailProps) {
  return (
    <EmailLayout
      preview={`${reviewerName} left a ${rating}-star review on ${productName}.`}
    >
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>
        New review, {founderFirstName}.
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        {reviewerName} {isVerified ? "(verified customer) " : ""}gave{" "}
        <strong>{productName}</strong> {rating}/5.
      </Text>
      <Text
        style={{
          fontSize: 14,
          lineHeight: "22px",
          color: "#404040",
          borderLeft: "3px solid #FACC15",
          paddingLeft: 12,
          margin: "16px 0",
        }}
      >
        {excerpt}
      </Text>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        Replying within 48 hours lifts your trust score and keeps the
        conversation visible on your public page.
      </Text>
      <Button
        href={replyUrl}
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
        Reply to review
      </Button>
    </EmailLayout>
  );
}
