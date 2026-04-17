import { generate } from "../generate.js";

export interface ProductDescriptionInput {
  workspaceId: string;
  name: string;
  tagline: string;
  category: string;
  features: string[];
  audience: string;
}

const SYSTEM = `You are a senior product marketer for indie SaaS. Write concise, scannable product descriptions in plain English. No hype, no emojis, no exclamation points. 80-120 words. Target the buyer, not the founder.`;

export async function generateProductDescription(input: ProductDescriptionInput) {
  const prompt = `Write a product description.

Product: ${input.name}
Tagline: ${input.tagline}
Category: ${input.category}
Audience: ${input.audience}
Key features:
${input.features.map((f) => `- ${f}`).join("\n")}

Output only the description. No headings, no lists.`;

  return generate({
    model: "gemini-1.5-flash",
    prompt,
    systemInstruction: SYSTEM,
    temperature: 0.5,
    maxOutputTokens: 400,
    workspaceId: input.workspaceId,
    purpose: "product_description",
  });
}
