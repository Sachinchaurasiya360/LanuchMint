import { generate } from "../generate.js";

export interface KeywordSuggestionsInput {
  workspaceId: string;
  productName: string;
  productTagline: string;
  productDescription: string;
  productCategory: string;
  seedKeywords?: string[];
  count?: number;
}

export interface KeywordSuggestion {
  keyword: string;
  intent: "informational" | "commercial" | "transactional" | "navigational";
  rationale: string;
}

export interface KeywordSuggestionsResult {
  suggestions: KeywordSuggestion[];
  raw: string;
}

const SYSTEM = `You propose SEO keywords an indie SaaS should target. Rules:
- Return 8-15 keywords, each 2-5 words.
- Mix intents: informational, commercial, transactional. Skip navigational unless the brand is well-known.
- Avoid hyper-competitive head terms; bias toward long-tail with buyer intent.
- Rationale: one short clause (under 80 chars) on why this fits.

Return ONLY a JSON array. Each item: { "keyword": string, "intent": "informational"|"commercial"|"transactional"|"navigational", "rationale": string }. No prose, no code fences.`;

export async function generateKeywordSuggestions(
  input: KeywordSuggestionsInput,
): Promise<KeywordSuggestionsResult> {
  const prompt = `Product: ${input.productName}
Tagline: ${input.productTagline}
Category: ${input.productCategory}
Description:
${input.productDescription}

Seed keywords: ${(input.seedKeywords ?? []).join(", ") || "(none)"}
Count target: ${input.count ?? 12}

Return the JSON array now.`;

  const res = await generate({
    model: "gemini-1.5-flash",
    prompt,
    systemInstruction: SYSTEM,
    temperature: 0.4,
    maxOutputTokens: 800,
    workspaceId: input.workspaceId,
    purpose: "keyword_suggestions",
  });

  const cleaned = res.text.replace(/^```[a-z]*\n?|```$/gim, "").trim();
  let parsed: KeywordSuggestion[] = [];
  try {
    const data = JSON.parse(cleaned) as KeywordSuggestion[];
    if (Array.isArray(data)) parsed = data;
  } catch {
    parsed = [];
  }
  return { suggestions: parsed, raw: res.text };
}
