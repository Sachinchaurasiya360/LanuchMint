import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface TeamInviteEmailProps {
  inviterName: string;
  workspaceName: string;
  role: string;
  acceptUrl: string;
  expiresAt: string;
}

export function TeamInviteEmail({
  inviterName,
  workspaceName,
  role,
  acceptUrl,
  expiresAt,
}: TeamInviteEmailProps) {
  return (
    <EmailLayout
      preview={`${inviterName} invited you to ${workspaceName} on LaunchMint.`}
    >
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>
        Join {workspaceName} on LaunchMint.
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        {inviterName} invited you to collaborate on <strong>{workspaceName}</strong>
        {" "}as a <strong>{role}</strong>. You'll get access to product pages,
        analytics, reviews, and launch tools for this workspace.
      </Text>
      <Button
        href={acceptUrl}
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
        Accept invite
      </Button>
      <Text style={{ fontSize: 12, lineHeight: "20px", color: "#737373", marginTop: 16 }}>
        This invite expires on {expiresAt}.
      </Text>
    </EmailLayout>
  );
}
