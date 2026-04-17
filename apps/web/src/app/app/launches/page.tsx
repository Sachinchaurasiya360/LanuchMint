import Link from "next/link";
import { CalendarClock, Rocket, Sparkles } from "lucide-react";
import { db } from "@launchmint/db";
import { Badge, Button, EmptyState } from "@launchmint/ui";
import { requireSession } from "@/lib/session";
import { ScheduleLaunchForm } from "./schedule-form";
import { CancelLaunchButton, RecomputeReadinessButton } from "./row-actions";

export const dynamic = "force-dynamic";

interface ReadinessMeta {
  score?: number;
  summary?: string;
  blockers?: string[];
  suggestions?: string[];
  scoredAt?: string;
}

export default async function LaunchesPage() {
  const { workspaceId } = await requireSession();

  const products = await db.product.findMany({
    where: { workspaceId, deletedAt: null, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "desc" },
    include: {
      launches: {
        orderBy: { scheduledAt: "desc" },
        take: 1,
      },
    },
  });

  const upcoming = products.filter((p) =>
    p.launches[0]?.status === "SCHEDULED" || p.launches[0]?.status === "LIVE",
  );
  const draft = products.filter(
    (p) => !upcoming.includes(p),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Launches</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Schedule a launch, score readiness, and watch your spot on the
          leaderboard.
        </p>
      </header>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-muted-foreground">
          Scheduled & live
        </h2>
        {upcoming.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={Rocket}
              title="Nothing scheduled"
              description="Pick a product below and schedule its launch."
            />
          </div>
        ) : (
          <ul className="mt-3 grid gap-3">
            {upcoming.map((p) => {
              const launch = p.launches[0]!;
              const readiness =
                ((p.metadata as Record<string, unknown> | null)
                  ?.launchReadiness as ReadinessMeta | undefined) ?? null;
              return (
                <li key={p.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/app/products/${p.id}/edit`}
                        className="text-base font-semibold hover:underline"
                      >
                        {p.name}
                      </Link>
                      <div className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarClock className="h-3 w-3" />
                        {launch.scheduledAt.toISOString().slice(0, 16).replace("T", " ")} {launch.timezone}
                        <Badge
                          variant={launch.status === "LIVE" ? "default" : "secondary"}
                        >
                          {launch.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {readiness?.score !== undefined ? (
                        <Badge
                          variant={readiness.score >= 80 ? "default" : "secondary"}
                        >
                          <Sparkles className="mr-1 h-3 w-3" />
                          {readiness.score} / 100
                        </Badge>
                      ) : null}
                      <RecomputeReadinessButton productId={p.id} />
                      {launch.status === "SCHEDULED" ? (
                        <CancelLaunchButton launchId={launch.id} />
                      ) : null}
                    </div>
                  </div>
                  {readiness?.summary ? (
                    <p className="mt-3 text-sm text-foreground">
                      {readiness.summary}
                    </p>
                  ) : null}
                  {readiness?.blockers && readiness.blockers.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Blockers
                      </p>
                      <ul className="mt-1 list-disc pl-5 text-sm text-foreground">
                        {readiness.blockers.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {readiness?.suggestions && readiness.suggestions.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Suggestions
                      </p>
                      <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                        {readiness.suggestions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-medium text-muted-foreground">
          Schedule a new launch
        </h2>
        {draft.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            All your products already have a scheduled or live launch. Create a
            new product to schedule another.
          </p>
        ) : (
          <div className="mt-3 rounded-lg border p-4">
            <ScheduleLaunchForm
              products={draft.map((p) => ({ id: p.id, name: p.name }))}
            />
          </div>
        )}
      </section>

      <p className="mt-10 text-xs text-muted-foreground">
        Launches go live at the scheduled time. The leaderboard window is 24
        hours from go-live.{" "}
        <Link href="/today" className="underline">
          See today's leaderboard
        </Link>
        .
      </p>
    </div>
  );
}
