import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@launchmint/seo-meta";
import { Leaderboard } from "@/components/leaderboard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { dayBoundsUtc, getLeaderboardForRange, todayKeyUtc } from "@/lib/launches";

export const revalidate = 3600;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface Params {
  date: string;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  if (!DATE_RE.test(params.date)) return { title: "Not found" };
  return buildMetadata({
    title: `Launches on ${params.date} - LaunchMint`,
    description: `Products that launched on LaunchMint on ${params.date}. See the day's leaderboard, upvotes, and comments.`,
    path: `/launches/${params.date}`,
  });
}

export default async function LaunchesByDatePage({
  params,
}: {
  params: Params;
}) {
  if (!DATE_RE.test(params.date)) notFound();

  const { start, end } = dayBoundsUtc(params.date);
  if (end.getTime() > Date.now() + 24 * 60 * 60 * 1000) notFound();

  const entries = await getLeaderboardForRange(start, end);

  const prevDay = new Date(start.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const nextDay = new Date(start.getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const isFuture = start.getTime() > Date.now();
  const isToday = params.date === todayKeyUtc();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <header>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {params.date}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {isFuture
              ? "Scheduled launches"
              : isToday
                ? "Launching today"
                : "Launches this day"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            All products that {isFuture ? "are scheduled to launch" : "launched"} during this 24-hour UTC window.
          </p>
        </header>
        <div className="mt-8">
          <Leaderboard entries={entries} />
        </div>
        <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
          <Link href={`/launches/${prevDay}`} className="hover:underline">
            ← {prevDay}
          </Link>
          <Link href="/today" className="hover:underline">
            Today
          </Link>
          {nextDay <= todayKeyUtc() ? (
            <Link href={`/launches/${nextDay}`} className="hover:underline">
              {nextDay} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
