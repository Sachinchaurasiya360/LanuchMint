import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: "#ffffff",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
          color: "#0a0a0a",
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            margin: "0 auto",
            padding: "32px 24px",
          }}
        >
          <Section>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0a0a0a",
                margin: 0,
              }}
            >
              LaunchMint
            </Text>
          </Section>
          <Hr style={{ borderColor: "#e5e5e5", margin: "16px 0" }} />
          {children}
          <Hr style={{ borderColor: "#e5e5e5", margin: "24px 0" }} />
          <Text style={{ fontSize: 12, color: "#737373" }}>
            LaunchMint · Turn visibility into velocity.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
