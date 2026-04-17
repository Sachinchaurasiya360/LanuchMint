"use client";

import { useState, useTransition } from "react";
import { Button, Textarea } from "@launchmint/ui";
import { postCommentAction } from "./actions";

interface CommentFormProps {
  productId: string;
  parentId?: string | null;
  signedIn: boolean;
  onPosted?: () => void;
  placeholder?: string;
}

export function CommentForm({
  productId,
  parentId = null,
  signedIn,
  placeholder,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <p className="text-sm text-muted-foreground">
        <a
          href={`/signin?from=${encodeURIComponent(typeof window === "undefined" ? "/" : window.location.pathname)}`}
          className="underline"
        >
          Sign in
        </a>{" "}
        to comment.
      </p>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length === 0) return;
    setError(null);
    startTransition(async () => {
      try {
        await postCommentAction({ productId, body, parentId });
        setBody("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to post");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder ?? "Share your thoughts..."}
        rows={3}
        maxLength={2_000}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {body.length} / 2000
        </span>
        <Button type="submit" size="sm" disabled={isPending || body.trim().length === 0}>
          {isPending ? "Posting..." : parentId ? "Reply" : "Post comment"}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
