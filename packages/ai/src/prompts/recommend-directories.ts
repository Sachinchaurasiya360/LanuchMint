import { generate } from "../generate.js";

export interface DirectoryCandidate {
  id: string;
  slug: string;
  name: string;
  category: string[];
  niche: string | null;
  domainRating: number | null;
  cost: string;
}

export interface RecommendDirectoriesInput {
  workspaceId: string;
  productId: string;
  productName: string;
  productTagline: string;
  productCategory: string;
  productKeywords: string[];
  candidates: DirectoryCandidate[];
  topK: number;
}

export interface RankedDirectory {
  id: string;
  score: number;
  reason: string;
}

export interface RecommendDirectoriesResult {
  ranked: RankedDirectory[];
  raw: string;
}

const SYSTEM = `You match startup products to relevant submission directories.

Score each candidate from 0 to 100 based on:
- niche/category overlap with the product (most important)
- domain rating (higher is better, but only as a tiebreaker)
- cost (free > paid for early-stage products)

Output ONLY a JSON array of objects: { "id": string, "score": number, "reason": string <= 100 chars }.
No prose, no markdown fences, no commentary. Score every candidate.`;

export async function recommendDirectories(
  input: RecommendDirectoriesInput,
): Promise<RecommendDirectoriesResult> {
  const candidatesBlock = input.candidates
    .map(
      (c) =>
        `- id=${c.id} | ${c.name} | categories=[${c.category.join(", ")}] | niche=${c.niche ?? "general"} | DR=${c.domainRating ?? "?"} | cost=${c.cost}`,
    )
    .join("\n");

  const prompt = `Product: ${input.productName}
Tagline: ${input.productTagline}
Category: ${input.productCategory}
Keywords: ${input.productKeywords.join(", ") || "(none)"}

Candidate directories (${input.candidates.length}):
${candidatesBlock}

Return JSON array now. Score every id above.`;

  const res = await generate({
    model: "gemini-1.5-flash",
    prompt,
    systemInstruction: SYSTEM,
    temperature: 0.2,
    maxOutputTokens: 2_000,
    workspaceId: input.workspaceId,
    purpose: "recommend_directories",
  });

  const ranked = parse(res.text);
  ranked.sort((a, b) => b.score - a.score);
  return { ranked: ranked.slice(0, input.topK), raw: res.text };
}

function parse(text: string): RankedDirectory[] {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    const arr = JSON.parse(cleaned) as Array<{
      id?: string;
      score?: number;
      reason?: string;
    }>;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((r): r is { id: string; score: number; reason?: string } =>
        typeof r.id === "string" && typeof r.score === "number",
      )
      .map((r) => ({
        id: r.id,
        score: clamp(Math.round(r.score), 0, 100),
        reason: (r.reason ?? "").slice(0, 200),
      }));
  } catch {
    return [];
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
