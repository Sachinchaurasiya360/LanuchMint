import type { HandlerMap } from "@launchmint/queue";

/**
 * Stub: real moderation runs heuristics + Gemini classification, then
 * either auto-approves or flags for human review. Sprint 1 ships the queue
 * shape so producers can enqueue without conditional logic in callers.
 */
export const moderationHandlers: HandlerMap = {
  "moderation-scan": async (data) => {
    console.log(`[moderation] scanning ${data.entityType}:${data.entityId}`);
  },
};
