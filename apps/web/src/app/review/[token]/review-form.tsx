"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button, Input, Label, Textarea } from "@launchmint/ui";
import { submitReviewAction } from "./actions";

export function ReviewSubmitForm({
  token,
  productSlug,
}: {
  token: string;
  productSlug: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating === 0) {
      setError("Pick a rating from 1 to 5.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await submitReviewAction({ token, rating, title, body });
        router.push(`/products/${res.productSlug}?reviewed=1`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to submit";
        setError(humanize(msg));
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <Label>Rating</Label>
        <div
          className="mt-1 flex items-center gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            const filled = value <= (hover || rating);
            return (
              <button
                key={value}
                type="button"
                aria-label={`${value} star`}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHover(value)}
                className="text-amber-500"
              >
                <Star className="h-7 w-7" fill={filled ? "currentColor" : "none"} />
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <Label htmlFor="review-title">Title (optional)</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="What stood out"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="review-body">Your review</Label>
        <Textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          maxLength={5_000}
          placeholder="What worked, what didn't, what you'd want next."
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {body.length} / 5000 - minimum 30 characters.
        </p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}

function humanize(raw: string): string {
  if (raw.startsWith("INVALID_TOKEN")) return "This invite link is no longer valid.";
  if (raw === "ALREADY_REVIEWED") return "You've already submitted a review for this product.";
  if (raw === "PRODUCT_NOT_FOUND") return "This product is no longer available.";
  return raw;
}
