import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface WelcomeEmailProps {
  firstName: string;
  dashboardUrl: string;
}

export function WelcomeEmail({ firstName, dashboardUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to LaunchMint - let's get your launch ready.">
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>
        Welcome, {firstName}.
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        Your workspace is live. The next step is to add your first product, drop
        in screenshots, and pick a launch day.
      </Text>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        We'll handle SEO pages, JSON-LD, and the launch-day checklist for you.
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
        Open dashboard
      </Button>
    </EmailLayout>
  );
}
