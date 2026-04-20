import { generate } from "../generate.js";

export interface SocialPostLinkedInInput {
  workspaceId: string;
  productName: string;
  productTagline: string;
  productUrl: string;
  angle: "launch" | "milestone" | "teardown" | "build_in_public";
  contextNote?: string | null;
}

export interface SocialPostLinkedInResult {
  post: string;
  raw: string;
}

const SYSTEM = `You write LinkedIn posts for indie founders. Rules:
- 900-1,200 characters total. Short paragraphs (1-3 lines each), blank line between them.
- Open with a specific claim or number. Never "I'm thrilled to announce".
- Plain text only - no markdown, no bullets with asterisks, no emoji.
- End with the URL on its own line.
- No hashtags.

Output ONLY the post text.`;

const ANGLES: Record<SocialPostLinkedInInput["angle"], string> = {
  launch: "Launch announcement for a B2B/professional audience.",
  milestone: "Sharing a business or growth milestone with operators in mind.",
  teardown: "Explaining one decision or tradeoff in plain business language.",
  build_in_public: "Weekly reflection on what shipped and what was learned.",
};

export async function generateSocialPostLinkedIn(
  input: SocialPostLinkedInInput,
): Promise<SocialPostLinkedInResult> {
  const prompt = `Product: ${input.productName}
Tagline: ${input.productTagline}
URL: ${input.productUrl}
Angle: ${ANGLES[input.angle]}
Context: ${input.contextNote ?? "(none)"}

Write the post now.`;

  const res = await generate({
    model: "gemini-1.5-flash",
    prompt,
    systemInstruction: SYSTEM,
    temperature: 0.6,
    maxOutputTokens: 600,
    workspaceId: input.workspaceId,
    purpose: "social_post_linkedin",
  });

  const post = res.text.replace(/^["'`]+|["'`]+$/g, "").trim();
  return { post, raw: res.text };
}
