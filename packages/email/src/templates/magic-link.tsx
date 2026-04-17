import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface MagicLinkEmailProps {
  url: string;
  expiresInMinutes: number;
}

export function MagicLinkEmail({ url, expiresInMinutes }: MagicLinkEmailProps) {
  return (
    <EmailLayout preview="Your sign-in link for LaunchMint">
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>Sign in to LaunchMint</Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        Click the button below to sign in. The link is valid for the next{" "}
        {expiresInMinutes} minutes.
      </Text>
      <Button
        href={url}
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
        Sign in
      </Button>
      <Text style={{ fontSize: 12, color: "#737373", marginTop: 24 }}>
        If you didn't request this, you can ignore this email.
      </Text>
    </EmailLayout>
  );
}
