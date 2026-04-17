import { generate } from "../generate.js";

export interface DirectoryDescriptionInput {
  workspaceId: string;
  productId: string;
  productName: string;
  productTagline: string;
  productDescription: string;
  productCategory: string;
  productUrl: string;
  directoryName: string;
  directoryNiche: string | null;
  directoryAudience: string;
  maxLength: number;
}

export interface DirectoryDescriptionResult {
  description: string;
  raw: string;
}

const SYSTEM = `You write submission copy for startup directories. Your job is to take a product and tailor a single-paragraph description to fit a specific directory's audience.

Rules:
- Match the requested character budget tightly. Never exceed it. Aim for 90-100% of budget.
- Speak to the directory's audience, not generically.
- Lead with the concrete user benefit, not buzzwords.
- No emoji. No markdown. No quotes around the result. No first-person plural ("we"). No exclamation marks.
- Do not invent features. Stay faithful to the product description.

Output ONLY the paragraph. No preface, no labels.`;

export async function generateDirectoryDescription(
  input: DirectoryDescriptionInput,
): Promise<DirectoryDescriptionResult> {
  const prompt = `Product: ${input.productName}
Tagline: ${input.productTagline}
Category: ${input.productCategory}
URL: ${input.productUrl}
Description:
${input.productDescription}

Directory: ${input.directoryName}
Directory niche: ${input.directoryNiche ?? "general startup directory"}
Directory audience: ${input.directoryAudience}
Character budget: ${input.maxLength}

Write the submission paragraph now.`;

  const res = await generate({
    model: "gemini-1.5-flash",
    prompt,
    systemInstruction: SYSTEM,
    temperature: 0.5,
    maxOutputTokens: 400,
    workspaceId: input.workspaceId,
    purpose: "directory_description",
  });

  const description = res.text
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/^```[a-z]*\n?|```$/gim, "")
    .trim()
    .slice(0, input.maxLength);

  return { description, raw: res.text };
}
