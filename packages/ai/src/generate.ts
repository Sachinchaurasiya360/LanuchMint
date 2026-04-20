import { db } from "@launchmint/db";
import { track } from "@launchmint/analytics";
import { COST_PER_1M_TOKENS, getGemini, type GeminiModel } from "./client.js";

export interface GenerateArgs {
  model: GeminiModel;
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  workspaceId?: string;
  userId?: string;
  purpose?: string;
}

export interface GenerateResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export async function generate(args: GenerateArgs): Promise<GenerateResult> {
  const gemini = getGemini();
  const model = gemini.getGenerativeModel({
    model: args.model,
    systemInstruction: args.systemInstruction,
    generationConfig: {
      temperature: args.temperature ?? 0.7,
      maxOutputTokens: args.maxOutputTokens ?? 1024,
    },
  });

  const startedAt = Date.now();
  let text = "";
  let inputTokens = 0;
  let outputTokens = 0;
  let status: "success" | "error" = "success";

  try {
    const res = await model.generateContent(args.prompt);
    text = res.response.text();
    const usage = res.response.usageMetadata;
    inputTokens = usage?.promptTokenCount ?? 0;
    outputTokens = usage?.candidatesTokenCount ?? 0;
  } catch (err) {
    status = "error";
    throw err;
  } finally {
    if (args.workspaceId) {
      const rate = COST_PER_1M_TOKENS[args.model];
      const costCents = Math.ceil(
        ((inputTokens / 1_000_000) * rate.input +
          (outputTokens / 1_000_000) * rate.output) *
          100,
      );
      const latencyMs = Date.now() - startedAt;
      await db.aiGeneration
        .create({
          data: {
            workspaceId: args.workspaceId,
            userId: args.userId,
            type: args.purpose ?? "ad-hoc",
            model: args.model,
            promptTokens: inputTokens,
            outputTokens,
            costCents,
            creditsCharged: 1,
            status,
            prompt: args.prompt.slice(0, 4_000),
            output: text.slice(0, 4_000),
            latencyMs,
          },
        })
        .catch(() => {
          // best-effort logging
        });
      track(args.userId ?? args.workspaceId, "ai_generation_requested", {
        type: args.purpose ?? "ad-hoc",
        model: args.model,
        creditsCharged: 1,
        latencyMs,
        status: status === "success" ? "ok" : "error",
      });
    }
  }

  const rate = COST_PER_1M_TOKENS[args.model];
  const costUsd =
    (inputTokens / 1_000_000) * rate.input +
    (outputTokens / 1_000_000) * rate.output;

  return { text, inputTokens, outputTokens, costUsd };
}
