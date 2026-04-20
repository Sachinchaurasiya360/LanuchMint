import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface ReviewInviteEmailProps {
  productName: string;
  founderName: string;
  reviewUrl: string;
  personalNote?: string;
}

export function ReviewInviteEmail({
  productName,
  founderName,
  reviewUrl,
  personalNote,
}: ReviewInviteEmailProps) {
  return (
    <EmailLayout preview={`${founderName} would like your review of ${productName}.`}>
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>
        Could you review {productName}?
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        {founderName} asked us to send this. Your review will appear on the
        {" "}
        {productName} page on LaunchMint, with a "Verified Customer" badge -
        because the link came from the email they have on file.
      </Text>
      {personalNote ? (
        <Text
          style={{
            fontSize: 14,
            lineHeight: "22px",
            color: "#404040",
            backgroundColor: "#fafaf9",
            borderLeft: "3px solid #FACC15",
            padding: "8px 12px",
          }}
        >
          “{personalNote}”
        </Text>
      ) : null}
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        Two minutes is enough. Honest beats glowing.
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
        Write a review
      </Button>
      <Text style={{ fontSize: 11, color: "#a3a3a3", marginTop: 18 }}>
        This link is single-use and expires in 21 days. If it wasn't you,
        ignore this email.
      </Text>
    </EmailLayout>
  );
}
