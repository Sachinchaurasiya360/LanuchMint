import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout.js";

export interface LaunchReminderEmailProps {
  firstName: string;
  productName: string;
  daysOut: 3 | 1;
  scheduledFor: string;
  checklistUrl: string;
}

export function LaunchReminderEmail({
  firstName,
  productName,
  daysOut,
  scheduledFor,
  checklistUrl,
}: LaunchReminderEmailProps) {
  const headline =
    daysOut === 3
      ? `${productName} launches in 3 days`
      : `${productName} launches tomorrow`;

  return (
    <EmailLayout preview={`${headline} - finish your checklist.`}>
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>
        {firstName}, {headline.toLowerCase()}.
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        Scheduled for {scheduledFor}. Take 10 minutes to walk the launch
        checklist - assets, copy, social posts, and the cross-post plan.
      </Text>
      <Text style={{ fontSize: 14, lineHeight: "22px", color: "#404040" }}>
        {daysOut === 1
          ? "Tomorrow you'll be in the comments - not editing copy. Lock it down today."
          : "There's still time to fix anything the readiness scorer flagged."}
      </Text>
      <Button
        href={checklistUrl}
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
        Open launch checklist
      </Button>
    </EmailLayout>
  );
}
