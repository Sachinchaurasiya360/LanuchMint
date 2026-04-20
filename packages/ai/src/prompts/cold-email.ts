import { generate } from "../generate.js";

export interface ColdEmailInput {
  workspaceId: string;
  productName: string;
  productTagline: string;
  productUrl: string;
  recipientName?: string | null;
  recipientRole?: string | null;
  recipientCompany?: string | null;
  goal: "review_invite" | "partnership" | "press" | "user_research";
}

export interface ColdEmailResult {
  subject: string;
  body: string;
  raw: string;
}

const SYSTEM = `You write short, deliverable cold emails for indie founders. Rules:
- 80 words or fewer in the body. Plain text. No markdown.
- One clear ask. Never more.
- No buzzwords ("synergy", "circle back", "leverage", "game-changer").
- No emoji. No exclamation marks. No "I hope this email finds you well".
- Subject line under 50 characters, lowercase-friendly, specific.

Output format (exactly):
SUBJECT: <subject line>
BODY:
<body lines>`;

const GOAL_HINTS: Record<ColdEmailInput["goal"], string> = {
  review_invite: "Ask the recipient to leave a short review after trying the product.",
  partnership: "Propose a concrete, low-commitment collaboration.",
  press: "Offer a short story angle; no attachments, no ask for coverage yet.",
  user_research: "Request a 20-minute call to learn how they solve this problem today.",
};

export async function generateColdEmail(input: ColdEmailInput): Promise<ColdEmailResult> {
  const prompt = `Product: ${input.productName}
Tagline: ${input.productTagline}
URL: ${input.productUrl}
Recipient: ${input.recipientName ?? "(unknown)"}${input.recipientRole ? ", " + input.recipientRole : ""}${input.recipientCompany ? " at " + input.recipientCompany : ""}
Goal: ${GOAL_HINTS[input.goal]}

Write the email now.`;

  const res = await generate({
    model: "gemini-1.5-flash",
    prompt,
    systemInstruction: SYSTEM,
    temperature: 0.6,
    maxOutputTokens: 400,
    workspaceId: input.workspaceId,
    purpose: "cold_email",
  });

  const text = res.text.trim();
  const subjectMatch = text.match(/SUBJECT:\s*(.+)/i);
  const bodyMatch = text.match(/BODY:\s*([\s\S]+)$/i);
  const subject = subjectMatch?.[1]?.trim() ?? "";
  const body = bodyMatch?.[1]?.trim() ?? text;
  return { subject, body, raw: res.text };
}
