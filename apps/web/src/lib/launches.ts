import { db } from "@launchmint/db";
import type { LeaderboardEntry } from "@/components/leaderboard";

const HOUR_MS = 60 * 60 * 1000;

export async function getLeaderboardForRange(
  start: Date,
  end: Date,
): Promise<LeaderboardEntry[]> {
  const launches = await db.launch.findMany({
    where: {
      OR: [
        { goneLiveAt: { gte: start, lt: end } },
        {
          status: "SCHEDULED",
          scheduledAt: { gte: start, lt: end },
        },
      ],
    },
    orderBy: [{ upvoteCount: "desc" }, { goneLiveAt: "asc" }],
    include: {
      product: {
        include: {
          workspace: {
            include: {
              founderProfile: { select: { displayName: true, slug: true } },
            },
          },
        },
      },
    },
  });

  return launches.map((l) => ({
    launchId: l.id,
    rank: l.rank,
    productSlug: l.product.slug,
    productName: l.product.name,
    tagline: l.product.tagline,
    category: l.product.category,
    logoUrl: l.product.logoUrl,
    upvoteCount: l.upvoteCount,
    commentCount: l.commentCount,
    founderName: l.product.workspace.founderProfile?.displayName ?? null,
    founderSlug: l.product.workspace.founderProfile?.slug ?? null,
  }));
}

export function dayBoundsUtc(dayKey: string): { start: Date; end: Date } {
  const start = new Date(`${dayKey}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) {
    throw new Error(`invalid day key ${dayKey}`);
  }
  const end = new Date(start.getTime() + 24 * HOUR_MS);
  return { start, end };
}

export function todayKeyUtc(): string {
  return new Date().toISOString().slice(0, 10);
}
