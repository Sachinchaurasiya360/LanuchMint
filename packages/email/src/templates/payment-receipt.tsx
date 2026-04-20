import { Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface PaymentReceiptEmailProps {
  firstName: string;
  plan: string;
  amount: string;
  currency: string;
  invoiceId: string;
  invoiceUrl: string;
  periodStart: string;
  periodEnd: string;
}

export function PaymentReceiptEmail(props: PaymentReceiptEmailProps) {
  return (
    <EmailLayout preview={`Receipt for ${props.plan} - ${props.amount} ${props.currency}`}>
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>Payment received</Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        Thanks, {props.firstName}. Your subscription to the{" "}
        <strong>{props.plan}</strong> plan has been renewed.
      </Text>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        <strong>Amount:</strong> {props.amount} {props.currency}
        <br />
        <strong>Invoice:</strong> {props.invoiceId}
        <br />
        <strong>Period:</strong> {props.periodStart} → {props.periodEnd}
      </Text>
      <Text style={{ fontSize: 14, lineHeight: "22px" }}>
        <a href={props.invoiceUrl} style={{ color: "#0a0a0a", fontWeight: 600 }}>
          Download invoice
        </a>
      </Text>
    </EmailLayout>
  );
}
