import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface PaymentFailedEmailProps {
  firstName: string;
  planName: string;
  amountFormatted: string;
  reason: string;
  retryAt: string | null;
  billingUrl: string;
}

export function PaymentFailedEmail({
  firstName,
  planName,
  amountFormatted,
  reason,
  retryAt,
  billingUrl,
}: PaymentFailedEmailProps) {
  return (
    <EmailLayout
      preview={`Payment for ${planName} didn't go through - action needed.`}
    >
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>
        Your {planName} payment failed, {firstName}.
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        We couldn't charge your payment method for {amountFormatted}. Reason
        reported by your bank: <strong>{reason}</strong>.
      </Text>
      {retryAt ? (
        <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
          We'll retry on {retryAt}. Update your card sooner to keep your plan
          active and avoid a downgrade.
        </Text>
      ) : (
        <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
          Update your payment method to keep your plan active.
        </Text>
      )}
      <Button
        href={billingUrl}
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
        Update payment method
      </Button>
    </EmailLayout>
  );
}
