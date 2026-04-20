"use client";

import { useState, useTransition } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@launchmint/ui";
import { toggleUpvoteAction } from "./actions";

export function UpvoteButton({
  productId,
  initialCount,
  initialUpvoted,
  signedIn,
}: {
  productId: string;
  initialCount: number;
  initialUpvoted: boolean;
  signedIn: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [isPending, startTransition] = useTransition();

  function onClick() {
    if (!signedIn) {
      window.location.href = `/signin?from=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    startTransition(async () => {
      try {
        const res = await toggleUpvoteAction(productId);
        setCount(res.count);
        setUpvoted(res.upvoted);
      } catch {
        // best-effort UI feedback; reload to resync
      }
    });
  }

  return (
    <Button
      type="button"
      variant={upvoted ? "default" : "outline"}
      onClick={onClick}
      disabled={isPending}
      aria-label={upvoted ? `Remove your upvote (${count} total)` : `Upvote this product (${count} so far)`}
      aria-pressed={upvoted}
      className="flex h-12 flex-col items-center justify-center gap-0 px-4"
    >
      <ChevronUp className="h-4 w-4" aria-hidden="true" />
      <span className="text-sm font-semibold">{count}</span>
    </Button>
  );
}
