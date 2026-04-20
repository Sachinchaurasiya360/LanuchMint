import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface ReviewRepliedEmailProps {
  reviewerFirstName: string;
  founderName: string;
  productName: string;
  replyExcerpt: string;
  reviewUrl: string;
}

export function ReviewRepliedEmail({
  reviewerFirstName,
  founderName,
  productName,
  replyExcerpt,
  reviewUrl,
}: ReviewRepliedEmailProps) {
  return (
    <EmailLayout
      preview={`${founderName} replied to your ${productName} review.`}
    >
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>
        {founderName} replied, {reviewerFirstName}.
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        The founder of <strong>{productName}</strong> responded to your review.
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
        {replyExcerpt}
      </Text>
      <Button
        href={reviewUrl}
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
        View reply
      </Button>
    </EmailLayout>
  );
}
