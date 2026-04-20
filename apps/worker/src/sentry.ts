import * as Sentry from "@sentry/node";

const dsn = process.env.SENTRY_DSN;

export function initSentry(): void {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  });
}

export function captureError(err: unknown, context?: Record<string, unknown>): void {
  if (!dsn) return;
  Sentry.captureException(err, context ? { extra: context } : undefined);
}

export async function flushSentry(): Promise<void> {
  if (!dsn) return;
  await Sentry.flush(2_000);
}
