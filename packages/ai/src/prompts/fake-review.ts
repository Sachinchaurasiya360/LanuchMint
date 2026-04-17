import { generate } from "../generate.js";

export interface FakeReviewInput {
  workspaceId: string;
  reviewId: string;
  productName: string;
  productCategory: string;
  rating: number;
  title?: string;
  body: string;
  isVerifiedEmail: boolean;
  authorPriorReviewCount: number;
}

export interface FakeReviewResult {
  fakeScore: number;
  reasons: string[];
  raw: string;
}

const SYSTEM = `You are a moderation classifier for product reviews. Score how likely a review is fake, paid, or AI-generated on a 0.0-1.0 scale.

Heuristics that raise the score:
- generic phrasing that could apply to any product
- excessive superlatives without specifics
- copy-pasted marketing language
- mismatch between rating and tone (e.g., 5-star rating + neutral content, or 1-star + positive content)
- author has no other reviews and the email is not verified
- text reads as model output (uniform sentence structure, no idioms, no typos, hedge words like "as an AI")

Heuristics that lower the score:
- specific feature names, workflow details, or numbers
- mentions of trade-offs or honest negatives
- email is verified
- author has prior review history

Output ONLY JSON: { "fakeScore": number 0.0-1.0, "reasons": string[] }
No prose, no markdown.`;

export async function classifyFakeReview(
  input: FakeReviewInput,
): Promise<FakeReviewResult> {
  const prompt = `Score this review.

Product: ${input.productName} (${input.productCategory})
Rating: ${input.rating} / 5
Verified email: ${input.isVerifiedEmail ? "yes" : "no"}
Prior reviews from this author: ${input.authorPriorReviewCount}
Title: ${input.title ?? "(none)"}
Body:
${input.body}

Return JSON only.`;

  const res = await generate({
    model: "gemini-1.5-flash",
    prompt,
    systemInstruction: SYSTEM,
    temperature: 0.1,
    maxOutputTokens: 250,
    workspaceId: input.workspaceId,
    purpose: "fake_review_classify",
  });

  return { ...parse(res.text), raw: res.text };
}

function parse(text: string): Omit<FakeReviewResult, "raw"> {
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    const obj = JSON.parse(cleaned) as { fakeScore?: number; reasons?: string[] };
    return {
      fakeScore: clamp(obj.fakeScore ?? 0, 0, 1),
      reasons: Array.isArray(obj.reasons) ? obj.reasons.slice(0, 6) : [],
    };
  } catch {
    return { fakeScore: 0, reasons: ["parse-error"] };
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
