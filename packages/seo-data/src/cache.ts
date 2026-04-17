import { getRedis } from "@launchmint/queue";

const PREFIX = "seo:cache:";

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const redis = getRedis();
  const full = PREFIX + key;
  const hit = await redis.get(full);
  if (hit) {
    try {
      return JSON.parse(hit) as T;
    } catch {
      // fall through and refetch
    }
  }
  const fresh = await loader();
  await redis.setex(full, ttlSeconds, JSON.stringify(fresh));
  return fresh;
}
