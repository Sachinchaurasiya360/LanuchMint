import { generate } from "../generate.js";

export interface ReviewReplyInput {
  workspaceId: string;
  productName: string;
  founderName: string;
  reviewRating: number;
  reviewTitle?: string;
  reviewBody: string;
}

const SYSTEM = `You write founder replies to product reviews. Voice: warm, concrete, specific. Never defensive. Never marketing-speak. 50-90 words. No emojis, no exclamation points.

Rules:
- Address the reviewer by name only if they signed off; otherwise no greeting.
- Acknowledge what they said — quote one specific phrase if useful.
- For criticism: thank them, accept the point, name the next step honestly.
- For praise: thank them once, then add a short note on what's coming next.
- Sign off as the founder by first name only. No company plug.

Output ONLY the reply body. No subject line, no headers.`;

export async function generateReviewReply(input: ReviewReplyInput) {
  const prompt = `Draft a reply.

Product: ${input.productName}
Founder name: ${input.founderName}
Review rating: ${input.reviewRating} / 5
Review title: ${input.reviewTitle ?? "(none)"}
Review body:
${input.reviewBody}`;

  return generate({
    model: "gemini-1.5-flash",
    prompt,
    systemInstruction: SYSTEM,
    temperature: 0.6,
    maxOutputTokens: 300,
    workspaceId: input.workspaceId,
    purpose: "review_reply",
  });
}
