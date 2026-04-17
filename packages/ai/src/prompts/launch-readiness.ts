import { generate } from "../generate.js";

export interface LaunchReadinessInput {
  workspaceId: string;
  productId: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  websiteUrl: string;
  hasLogo: boolean;
  hasOgImage: boolean;
  screenshotCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  seoKeywordCount: number;
}

export interface LaunchReadinessResult {
  score: number;
  summary: string;
  blockers: string[];
  suggestions: string[];
  raw: string;
}

const SYSTEM = `You are a senior launch coach for indie founders. Score a product's readiness for a public launch on a 0-100 scale. Be rigorous but fair. Output ONLY valid JSON matching the schema. No prose, no markdown fences, no commentary.

Score rubric:
- 90-100: ready to launch today
- 70-89:  small polish items remain
- 50-69:  significant gaps in copy, assets, or positioning
- 0-49:   not ready — fundamental work missing

Schema:
{ "score": number 0-100, "summary": string <= 140 chars, "blockers": string[] (must-fix), "suggestions": string[] (nice-to-have) }`;

export async function generateLaunchReadiness(
  input: LaunchReadinessInput,
): Promise<LaunchReadinessResult> {
  const prompt = `Evaluate this product for launch readiness.

Name: ${input.name}
Tagline: ${input.tagline}
Category: ${input.category}
Website: ${input.websiteUrl}
Description (${input.description.length} chars):
${input.description}

Assets:
- Logo: ${input.hasLogo ? "yes" : "missing"}
- OG image: ${input.hasOgImage ? "yes" : "missing"}
- Screenshots: ${input.screenshotCount}

SEO:
- Meta title: ${input.metaTitle ?? "missing"}
- Meta description: ${input.metaDescription ?? "missing"}
- Tracked keywords: ${input.seoKeywordCount}

Return JSON only.`;

  const res = await generate({
    model: "gemini-1.5-pro",
    prompt,
    systemInstruction: SYSTEM,
    temperature: 0.2,
    maxOutputTokens: 600,
    workspaceId: input.workspaceId,
    purpose: "launch_readiness",
  });

  const parsed = parseReadinessJson(res.text);
  return { ...parsed, raw: res.text };
}

function parseReadinessJson(text: string): Omit<LaunchReadinessResult, "raw"> {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    const obj = JSON.parse(cleaned) as {
      score?: number;
      summary?: string;
      blockers?: string[];
      suggestions?: string[];
    };
    return {
      score: clamp(Math.round(obj.score ?? 0), 0, 100),
      summary: (obj.summary ?? "").trim().slice(0, 200),
      blockers: Array.isArray(obj.blockers) ? obj.blockers.slice(0, 10) : [],
      suggestions: Array.isArray(obj.suggestions)
        ? obj.suggestions.slice(0, 10)
        : [],
    };
  } catch {
    return { score: 0, summary: "AI output could not be parsed.", blockers: [], suggestions: [] };
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
