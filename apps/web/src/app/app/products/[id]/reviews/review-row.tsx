"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, Sparkles, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Textarea } from "@launchmint/ui";
import {
  moderateReviewAction,
  replyToReviewAction,
  suggestReplyAction,
} from "./actions";
import type { FounderReviewVm } from "./page";

export function ReviewRow({ review }: { review: FounderReviewVm }) {
  const [reply, setReply] = useState(review.reply?.body ?? "");
  const [editing, setEditing] = useState(!review.reply);
  const [error, setError] = useState<string | null>(null);
  const [isReplyPending, startReplyTransition] = useTransition();
  const [isAiPending, startAiTransition] = useTransition();
  const [isModPending, startModTransition] = useTransition();

  const initial = review.authorName[0]?.toUpperCase() ?? "?";

  return (
    <li className="rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          {review.authorAvatar ? (
            <AvatarImage src={review.authorAvatar} alt={review.authorName} />
          ) : null}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{review.authorName}</span>
            <span className="inline-flex items-center text-sm text-amber-600">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3"
                  fill={i < review.rating ? "currentColor" : "none"}
                />
              ))}
            </span>
            {review.isVerified ? (
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="h-3 w-3" /> Verified
              </Badge>
            ) : null}
            {review.isFlagged ? (
              <Badge variant="default">Flagged · {review.fakeScore?.toFixed(2)}</Badge>
            ) : null}
            {review.status !== "PUBLISHED" && !review.isFlagged ? (
              <Badge variant="secondary">{review.status}</Badge>
            ) : null}
          </div>
          {review.title ? (
            <p className="mt-1 text-sm font-medium">{review.title}</p>
          ) : null}
          <p className="mt-1 whitespace-pre-line text-sm leading-6">{review.body}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {review.isFlagged || review.status !== "PUBLISHED" ? (
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isModPending}
            onClick={() =>
              startModTransition(async () => {
                await moderateReviewAction(review.id, "publish");
              })
            }
          >
            Approve & publish
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isModPending}
            onClick={() => {
              if (!confirm("Remove this review?")) return;
              startModTransition(async () => {
                await moderateReviewAction(review.id, "remove");
              });
            }}
          >
            Remove
          </Button>
        </div>
      ) : null}

      <div className="mt-4 rounded-md bg-secondary/40 p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Founder reply
          </p>
          {!editing && review.reply ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
              className="h-auto px-2 py-1 text-xs"
            >
              Edit
            </Button>
          ) : null}
        </div>
        {editing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              maxLength={4_000}
              placeholder="Thanks for the candid feedback..."
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                disabled={isReplyPending || reply.trim().length === 0}
                onClick={() =>
                  startReplyTransition(async () => {
                    setError(null);
                    try {
                      await replyToReviewAction({
                        reviewId: review.id,
                        body: reply,
                      });
                      setEditing(false);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Failed");
                    }
                  })
                }
              >
                {isReplyPending ? "Saving..." : "Save reply"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isAiPending}
                onClick={() =>
                  startAiTransition(async () => {
                    setError(null);
                    try {
                      const draft = await suggestReplyAction(review.id);
                      setReply(draft);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Failed");
                    }
                  })
                }
              >
                <Sparkles className="h-3 w-3" />{" "}
                {isAiPending ? "Drafting..." : "Suggest with AI"}
              </Button>
              {review.reply ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReply(review.reply?.body ?? "");
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              ) : null}
              {error ? <span className="text-xs text-red-600">{error}</span> : null}
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-line text-sm leading-6">
            {review.reply?.body}
          </p>
        )}
      </div>
    </li>
  );
}
