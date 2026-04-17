import Link from "next/link";
import { ChevronUp, MessageSquare } from "lucide-react";
import { Badge } from "@launchmint/ui";

export interface LeaderboardEntry {
  launchId: string;
  rank: number | null;
  productSlug: string;
  productName: string;
  tagline: string;
  category: string;
  logoUrl: string | null;
  upvoteCount: number;
  commentCount: number;
  founderName: string | null;
  founderSlug: string | null;
}

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        No launches yet. Check back soon.
      </p>
    );
  }
  return (
    <ol className="space-y-3">
      {entries.map((e, i) => (
        <li
          key={e.launchId}
          className="flex items-start gap-4 rounded-lg border p-4"
        >
          <div className="w-8 shrink-0 text-center">
            <div className="text-xs font-medium uppercase text-muted-foreground">
              #
            </div>
            <div className="text-lg font-semibold">{e.rank ?? i + 1}</div>
          </div>
          {e.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={e.logoUrl}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-md border"
            />
          ) : (
            <div className="h-12 w-12 shrink-0 rounded-md border bg-secondary" />
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/products/${e.productSlug}`}
                className="text-base font-semibold hover:underline"
              >
                {e.productName}
              </Link>
              <Badge variant="secondary">{e.category}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{e.tagline}</p>
            {e.founderName && e.founderSlug ? (
              <p className="mt-1 text-xs text-muted-foreground">
                by{" "}
                <Link
                  href={`/founders/${e.founderSlug}`}
                  className="hover:underline"
                >
                  {e.founderName}
                </Link>
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ChevronUp className="h-4 w-4" />
              {e.upvoteCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {e.commentCount}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
