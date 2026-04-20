import { db } from "@launchmint/db";
import { enqueue, type HandlerMap } from "@launchmint/queue";

const HOUR_MS = 60 * 60 * 1000;
const LAUNCH_WINDOW_HOURS = 24;

/**
 * Runs every minute (scheduled by the worker bootstrap). Drives all time-based
 * launch transitions so we don't need a separate cron service.
 *
 * Reminder bookkeeping is stored on `launch.metadata` to keep the schema lean:
 *   metadata.remindersSent: { d3?: ISO, d1?: ISO, live?: ISO }
 */
export const launchHandlers: HandlerMap = {
  "launch-tick": async () => {
    const now = new Date();

    // 1. Reminders for SCHEDULED launches that fall inside windows.
    const upcoming = await db.launch.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { gt: now },
      },
      select: { id: true, scheduledAt: true, metadata: true },
    });

    for (const l of upcoming) {
      const hoursUntil = (l.scheduledAt.getTime() - now.getTime()) / HOUR_MS;
      const meta =
        ((l.metadata as Record<string, unknown> | null) ?? {}) as {
          remindersSent?: { d3?: string; d1?: string; live?: string };
        };
      const sent = meta.remindersSent ?? {};

      if (hoursUntil <= 72 && hoursUntil > 24 && !sent.d3) {
        await enqueue("send-launch-reminder", { launchId: l.id, daysOut: 3 });
        await stampReminder(l.id, meta, "d3", now);
      } else if (hoursUntil <= 24 && !sent.d1) {
        await enqueue("send-launch-reminder", { launchId: l.id, daysOut: 1 });
        await stampReminder(l.id, meta, "d1", now);
      }
    }

    // 2. Flip SCHEDULED → LIVE for anything past its scheduledAt.
    const dueToGoLive = await db.launch.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
      },
      select: { id: true, productId: true, metadata: true },
    });

    for (const l of dueToGoLive) {
      await db.launch.update({
        where: { id: l.id },
        data: { status: "LIVE", goneLiveAt: now },
      });
      await db.product.update({
        where: { id: l.productId },
        data: { status: "LIVE", publishedAt: now },
      });
      const meta = ((l.metadata as Record<string, unknown> | null) ?? {}) as {
        remindersSent?: { d3?: string; d1?: string; live?: string };
      };
      if (!meta.remindersSent?.live) {
        await enqueue("send-launch-live", { launchId: l.id });
        await stampReminder(l.id, meta, "live", now);
      }
      await enqueue("index-product", { productId: l.productId }).catch(() => {});
    }

    // 3. End LIVE launches after the 24h window, then assign ranks.
    const endingCutoff = new Date(now.getTime() - LAUNCH_WINDOW_HOURS * HOUR_MS);
    const expiring = await db.launch.findMany({
      where: { status: "LIVE", goneLiveAt: { lte: endingCutoff } },
      select: { id: true, goneLiveAt: true },
    });

    const dayKeys = new Set<string>();
    for (const l of expiring) {
      await db.launch.update({
        where: { id: l.id },
        data: { status: "ENDED", endedAt: now },
      });
      if (l.goneLiveAt) dayKeys.add(toDayKey(l.goneLiveAt));
    }

    for (const dayKey of dayKeys) {
      await rankDay(dayKey);
    }
  },
};

async function stampReminder(
  launchId: string,
  meta: { remindersSent?: { d3?: string; d1?: string; live?: string } },
  key: "d3" | "d1" | "live",
  now: Date,
) {
  const next = {
    ...meta,
    remindersSent: { ...(meta.remindersSent ?? {}), [key]: now.toISOString() },
  };
  await db.launch.update({
    where: { id: launchId },
    data: { metadata: next },
  });
}

function toDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function rankDay(dayKey: string) {
  const dayStart = new Date(`${dayKey}T00:00:00.000Z`);
  const dayEnd = new Date(dayStart.getTime() + 24 * HOUR_MS);
  const entries = await db.launch.findMany({
    where: { goneLiveAt: { gte: dayStart, lt: dayEnd } },
    orderBy: [{ upvoteCount: "desc" }, { goneLiveAt: "asc" }],
    select: { id: true },
  });
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    await db.launch.update({
      where: { id: entry.id },
      data: { rank: i + 1 },
    });
  }
}
