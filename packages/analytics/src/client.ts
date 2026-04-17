import { PostHog } from "posthog-node";
import type { EventMap, EventName } from "./events.js";

let cached: PostHog | null = null;

function getPostHog(): PostHog | null {
  if (cached) return cached;
  const key = process.env.POSTHOG_KEY;
  if (!key) return null;
  cached = new PostHog(key, {
    host: process.env.POSTHOG_HOST ?? "https://app.posthog.com",
    flushAt: 20,
    flushInterval: 10_000,
  });
  return cached;
}

export function track<N extends EventName>(
  distinctId: string,
  event: N,
  properties?: EventMap[N],
): void {
  const ph = getPostHog();
  if (!ph) return;
  ph.capture({
    distinctId,
    event,
    properties: properties as Record<string, unknown> | undefined,
  });
}

export function identify(
  distinctId: string,
  properties: Record<string, unknown>,
): void {
  const ph = getPostHog();
  if (!ph) return;
  ph.identify({ distinctId, properties });
}

export async function shutdownAnalytics(): Promise<void> {
  if (cached) {
    await cached.shutdown();
    cached = null;
  }
}
