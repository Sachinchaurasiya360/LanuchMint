import { generate } from "../generate.js";

export interface SocialPostXInput {
  workspaceId: string;
  productName: string;
  productTagline: string;
  productUrl: string;
  angle: "launch" | "milestone" | "teardown" | "build_in_public";
  contextNote?: string | null;
}

export interface SocialPostXResult {
  post: string;
  raw: string;
}

const SYSTEM = `You write X/Twitter posts for indie founders. Rules:
- Strict 280-character limit (count URLs as 23 chars as X does).
- No hashtags. No emoji. No buzzwords.
- First line must hook - a concrete claim or specific number, not a question.
- Never lead with "We're excited to announce".
- Include the URL on a new line at the end.

Output ONLY the post text. No preface.`;

const ANGLES: Record<SocialPostXInput["angle"], string> = {
  launch: "Announcing the launch today.",
  milestone: "Sharing a specific metric or milestone.",
  teardown: "Explaining one design or engineering decision.",
  build_in_public: "A weekly update on what shipped.",
};

export async function generateSocialPostX(input: SocialPostXInput): Promise<SocialPostXResult> {
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
    temperature: 0.7,
    maxOutputTokens: 200,
    workspaceId: input.workspaceId,
    purpose: "social_post_x",
  });

  const post = res.text.replace(/^["'`]+|["'`]+$/g, "").trim();
  return { post, raw: res.text };
}
