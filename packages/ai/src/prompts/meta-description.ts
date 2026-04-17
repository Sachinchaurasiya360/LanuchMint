import { generate } from "../generate.js";

export interface MetaDescriptionInput {
  workspaceId: string;
  productName: string;
  tagline: string;
  category: string;
  primaryBenefit: string;
}

const SYSTEM = `You write SEO meta descriptions. Strict 140-160 character limit. One sentence. Concrete benefit + soft CTA. No emojis. No quotes. Use plain ASCII characters only.`;

export async function generateMetaDescription(input: MetaDescriptionInput) {
  const prompt = `Generate ONE meta description (no alternatives).

Product: ${input.productName}
Tagline: ${input.tagline}
Category: ${input.category}
Primary benefit: ${input.primaryBenefit}`;

  return generate({
    model: "gemini-1.5-flash",
    prompt,
    systemInstruction: SYSTEM,
    temperature: 0.4,
    maxOutputTokens: 96,
    workspaceId: input.workspaceId,
    purpose: "meta_description",
  });
}
