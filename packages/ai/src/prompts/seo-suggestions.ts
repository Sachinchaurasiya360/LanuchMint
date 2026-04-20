import { generate } from "../generate.js";

export interface SeoSuggestionsInput {
  workspaceId: string;
  productName: string;
  productTagline: string;
  productDescription: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  domainRating?: number | null;
  organicTraffic?: number | null;
  topKeywords?: { keyword: string; position: number }[];
  backlinkCount?: number | null;
}

export interface SeoSuggestion {
  area: "on_page" | "technical" | "content" | "backlinks";
  title: string;
  action: string;
  priority: "high" | "medium" | "low";
}

export interface SeoSuggestionsResult {
  suggestions: SeoSuggestion[];
  raw: string;
}

const SYSTEM = `You advise indie founders on practical SEO wins. Rules:
- Return 5-8 specific, actionable recommendations.
- Each action must be doable this week by a non-SEO specialist. No "hire an agency".
- Mix across on-page, technical, content, and backlinks when signals justify it.
- Prioritize based on effort-to-impact. "high" = cheap and impactful.

Return ONLY a JSON array. Each item: { "area": "on_page"|"technical"|"content"|"backlinks", "title": string (under 60 chars), "action": string (under 220 chars, imperative), "priority": "high"|"medium"|"low" }. No prose, no code fences.`;

export async function generateSeoSuggestions(
  input: SeoSuggestionsInput,
): Promise<SeoSuggestionsResult> {
  const prompt = `Product: ${input.productName}
Tagline: ${input.productTagline}
Description:
${input.productDescription}

Current meta title: ${input.metaTitle ?? "(none)"}
Current meta description: ${input.metaDescription ?? "(none)"}
Domain rating: ${input.domainRating ?? "unknown"}
Organic traffic (monthly est.): ${input.organicTraffic ?? "unknown"}
Backlinks: ${input.backlinkCount ?? "unknown"}
Top keywords: ${
    (input.topKeywords ?? [])
      .slice(0, 10)
      .map((k) => `${k.keyword} (#${k.position})`)
      .join("; ") || "(none)"
  }

Return the JSON array now.`;

  const res = await generate({
    model: "gemini-1.5-pro",
    prompt,
    systemInstruction: SYSTEM,
    temperature: 0.4,
    maxOutputTokens: 900,
    workspaceId: input.workspaceId,
    purpose: "seo_suggestions",
  });

  const cleaned = res.text.replace(/^```[a-z]*\n?|```$/gim, "").trim();
  let parsed: SeoSuggestion[] = [];
  try {
    const data = JSON.parse(cleaned) as SeoSuggestion[];
    if (Array.isArray(data)) parsed = data;
  } catch {
    parsed = [];
  }
  return { suggestions: parsed, raw: res.text };
}
