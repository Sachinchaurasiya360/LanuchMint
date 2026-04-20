import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface OnboardingNudgeEmailProps {
  firstName: string;
  resumeUrl: string;
  nextStep: string;
  stepsRemaining: number;
}

export function OnboardingNudgeEmail({
  firstName,
  resumeUrl,
  nextStep,
  stepsRemaining,
}: OnboardingNudgeEmailProps) {
  return (
    <EmailLayout preview={`${stepsRemaining} steps left to finish your LaunchMint setup.`}>
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>
        Pick up where you left off, {firstName}.
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        You're {stepsRemaining} step{stepsRemaining === 1 ? "" : "s"} away from a
        live product page. Next up: <strong>{nextStep}</strong>.
      </Text>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        Most founders finish setup in under 5 minutes.
      </Text>
      <Button
        href={resumeUrl}
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
        Resume setup
      </Button>
    </EmailLayout>
  );
}
