import { GoogleGenerativeAI } from "@google/generative-ai";

let cached: GoogleGenerativeAI | null = null;

export function getGemini(): GoogleGenerativeAI {
  if (cached) return cached;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  cached = new GoogleGenerativeAI(key);
  return cached;
}

export type GeminiModel = "gemini-1.5-pro" | "gemini-1.5-flash";

/**
 * Cost (USD) per 1M tokens. Update when Google's pricing changes.
 * Source: https://ai.google.dev/pricing
 */
export const COST_PER_1M_TOKENS: Record<GeminiModel, { input: number; output: number }> = {
  "gemini-1.5-pro": { input: 1.25, output: 5.0 },
  "gemini-1.5-flash": { input: 0.075, output: 0.3 },
};
