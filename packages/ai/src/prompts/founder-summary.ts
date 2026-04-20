import { generate } from "../generate.js";

export interface FounderSummaryInput {
  workspaceId: string;
  displayName: string;
  headline?: string | null;
  rawBio?: string | null;
  skills?: string[];
  priorWork?: string | null;
}

export interface FounderSummaryResult {
  headline: string;
  bio: string;
  raw: string;
}

const SYSTEM = `You write founder profile summaries for a public indie-maker directory. Rules:
- Headline: 60-80 characters, one clause, no title case vanity ("CEO & Founder").
- Bio: 2 short paragraphs, 60-110 words total, third-person.
- No emoji. No exclamation marks. No buzzwords. No "passionate about".
- Lead with what they ship, not what they feel.

Output format:
HEADLINE: <one line>
BIO:
<paragraphs>`;

export async function generateFounderSummary(
  input: FounderSummaryInput,
): Promise<FounderSummaryResult> {
  const prompt = `Name: ${input.displayName}
Current headline: ${input.headline ?? "(none)"}
Raw bio / notes: ${input.rawBio ?? "(none)"}
Skills: ${(input.skills ?? []).join(", ") || "(none)"}
Prior work: ${input.priorWork ?? "(none)"}

Write the summary now.`;

  const res = await generate({
    model: "gemini-1.5-flash",
    prompt,
    systemInstruction: SYSTEM,
    temperature: 0.5,
    maxOutputTokens: 500,
    workspaceId: input.workspaceId,
    purpose: "founder_summary",
  });

  const text = res.text.trim();
  const headline = text.match(/HEADLINE:\s*(.+)/i)?.[1]?.trim() ?? "";
  const bio = text.match(/BIO:\s*([\s\S]+)$/i)?.[1]?.trim() ?? text;
  return { headline, bio, raw: res.text };
}
