import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@launchmint/seo-meta";
import { Leaderboard } from "@/components/leaderboard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { dayBoundsUtc, getLeaderboardForRange, todayKeyUtc } from "@/lib/launches";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "Today's launches — LaunchMint",
  description:
    "The products launching on LaunchMint right now. Upvote, comment, and discover what indie founders are shipping today.",
  path: "/today",
});

export default async function TodayPage() {
  const today = todayKeyUtc();
  const { start, end } = dayBoundsUtc(today);
  const entries = await getLeaderboardForRange(start, end);

  const yesterday = new Date(start.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <header>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {today}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Launching today
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            The leaderboard refreshes every minute. Upvote products you'd back,
            and drop into the comments to ask the founders questions.
          </p>
        </header>
        <div className="mt-8">
          <Leaderboard entries={entries} />
        </div>
        <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
          <Link href={`/launches/${yesterday}`} className="hover:underline">
            ← Yesterday
          </Link>
          <span>UTC day window</span>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
