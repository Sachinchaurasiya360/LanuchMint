import { Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface AccountDeletedEmailProps {
  firstName: string;
  deletedAt: string;
  supportEmail: string;
}

export function AccountDeletedEmail({
  firstName,
  deletedAt,
  supportEmail,
}: AccountDeletedEmailProps) {
  return (
    <EmailLayout preview="Your LaunchMint account has been deleted.">
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>
        Account deleted, {firstName}.
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        We closed your LaunchMint account on <strong>{deletedAt}</strong>. Your
        personal data has been removed. Public product pages owned by your
        workspaces have been unpublished or transferred per your request.
      </Text>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        Invoices and legal records are retained for the period required by
        applicable law. If this was a mistake or you have questions, reply to
        this email or contact {supportEmail} within 30 days.
      </Text>
    </EmailLayout>
  );
}
