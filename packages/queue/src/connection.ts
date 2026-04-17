import { Redis } from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __launchmintRedis: Redis | undefined;
}

export function getRedis(): Redis {
  if (globalThis.__launchmintRedis) return globalThis.__launchmintRedis;
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  const redis = new Redis(url, { maxRetriesPerRequest: null });
  if (process.env.NODE_ENV !== "production") {
    globalThis.__launchmintRedis = redis;
  }
  return redis;
}
