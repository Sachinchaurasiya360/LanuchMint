import { generate } from "../generate.js";

export interface MetaTitleInput {
  workspaceId: string;
  productName: string;
  tagline: string;
  category: string;
}

const SYSTEM = `You write SEO meta titles. Strict 50-60 character limit. Format: "<Product> - <value prop> | LaunchMint". No emojis, no clickbait, no all-caps.`;

export async function generateMetaTitle(input: MetaTitleInput) {
  const prompt = `Generate ONE meta title (no alternatives, no quotes).

Product: ${input.productName}
Tagline: ${input.tagline}
Category: ${input.category}`;

  return generate({
    model: "gemini-1.5-flash",
    prompt,
    systemInstruction: SYSTEM,
    temperature: 0.4,
    maxOutputTokens: 64,
    workspaceId: input.workspaceId,
    purpose: "meta_title",
  });
}
