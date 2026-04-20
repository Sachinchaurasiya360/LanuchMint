"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, Copy, ExternalLink, RefreshCw, X } from "lucide-react";
import { Badge, Button, Input } from "@launchmint/ui";
import {
  dismissSubmissionAction,
  markSubmittedAction,
  regenerateDescriptionAction,
  startSubmissionAction,
} from "./actions";

export interface SubmissionVm {
  id: string;
  status: string;
  generatedDescription: string | null;
  notes: string | null;
  liveUrl: string | null;
  directory: {
    id: string;
    slug: string;
    name: string;
    url: string;
    submitUrl: string | null;
    hasApi: boolean;
    cost: string;
    domainRating: number | null;
  };
  recommendation: { score: number | null; reason: string | null } | null;
}

export function SubmissionRow({
  productId,
  submission,
}: {
  productId: string;
  submission: SubmissionVm;
}) {
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState(submission.generatedDescription ?? "");
  const [liveUrl, setLiveUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dir = submission.directory;
  const submitHref = dir.submitUrl ?? dir.url;

  function copy() {
    if (!draft) return;
    navigator.clipboard.writeText(draft).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2_000);
      },
      () => setError("Could not copy to clipboard"),
    );
  }

  function startFromHere() {
    setError(null);
    startTransition(async () => {
      try {
        await startSubmissionAction({ productId, directoryId: dir.id });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  function regenerate() {
    setError(null);
    startTransition(async () => {
      try {
        const next = await regenerateDescriptionAction(submission.id);
        setDraft(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  function markSubmitted() {
    setError(null);
    startTransition(async () => {
      try {
        await markSubmittedAction({
          submissionId: submission.id,
          liveUrl: liveUrl.trim() || undefined,
        });
        setLiveUrl("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  function dismiss() {
    setError(null);
    startTransition(async () => {
      try {
        await dismissSubmissionAction(submission.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/directories/${dir.slug}`}
              className="text-base font-semibold hover:underline"
            >
              {dir.name}
            </Link>
            <Badge variant="secondary">{dir.cost}</Badge>
            {dir.hasApi ? <Badge variant="secondary">API</Badge> : null}
            {typeof dir.domainRating === "number" ? (
              <span className="text-xs text-muted-foreground">
                DR {dir.domainRating}
              </span>
            ) : null}
            {submission.recommendation?.score != null ? (
              <Badge>match {submission.recommendation.score}</Badge>
            ) : null}
          </div>
          {submission.recommendation?.reason ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {submission.recommendation.reason}
            </p>
          ) : null}
          {submission.notes ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {submission.notes}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <a
            href={submitHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {submission.status === "PENDING" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            type="button"
            disabled={isPending}
            onClick={startFromHere}
          >
            {isPending ? "Starting..." : "Generate submission copy"}
          </Button>
          <Button
            size="sm"
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={dismiss}
          >
            <X className="h-3.5 w-3.5" /> Dismiss
          </Button>
        </div>
      ) : null}

      {(submission.status === "IN_PROGRESS" ||
        submission.status === "SUBMITTED") &&
      draft ? (
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Submission copy
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={regenerate}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {isPending ? "..." : "Rewrite"}
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={copy}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-line rounded-md border bg-muted/40 p-3 text-sm leading-6">
              {draft}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                htmlFor={`live-${submission.id}`}
                className="text-xs text-muted-foreground"
              >
                Live URL (optional - paste once published)
              </label>
              <Input
                id={`live-${submission.id}`}
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://example.com/listings/your-product"
                className="mt-1"
              />
            </div>
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={markSubmitted}
            >
              {liveUrl.trim()
                ? "Mark as live"
                : submission.status === "IN_PROGRESS"
                  ? "Mark submitted"
                  : "Re-verify"}
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
