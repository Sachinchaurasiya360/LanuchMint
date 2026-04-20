import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface SubscriptionCanceledEmailProps {
  firstName: string;
  planName: string;
  accessUntil: string;
  reactivateUrl: string;
}

export function SubscriptionCanceledEmail({
  firstName,
  planName,
  accessUntil,
  reactivateUrl,
}: SubscriptionCanceledEmailProps) {
  return (
    <EmailLayout
      preview={`Your ${planName} plan is canceled - access runs through ${accessUntil}.`}
    >
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>
        {planName} canceled, {firstName}.
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        Your subscription is marked to cancel. You'll keep full access to paid
        features through <strong>{accessUntil}</strong>, after which your
        workspace will move to the free plan.
      </Text>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        Your product pages, reviews, and MRR history stay intact - you can
        resume any time.
      </Text>
      <Button
        href={reactivateUrl}
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
        Reactivate plan
      </Button>
    </EmailLayout>
  );
}
