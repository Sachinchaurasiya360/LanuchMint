"use client";

import { useState, useTransition } from "react";
import { Button, Input, Label, Textarea } from "@launchmint/ui";
import { inviteReviewersAction } from "./actions";

export function InviteReviewersForm({ productId }: { productId: string }) {
  const [emails, setEmails] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setError(null);
    const list = emails
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length === 0) {
      setError("Add at least one email.");
      return;
    }
    if (list.length > 50) {
      setError("Send at most 50 invites at a time.");
      return;
    }
    startTransition(async () => {
      try {
        const r = await inviteReviewersAction({
          productId,
          emails: list,
          personalNote: note.trim() || undefined,
        });
        setResult(
          `Sent ${r.invited}. Skipped ${r.skippedDuplicates} duplicate, ${r.skippedInvalid} invalid.`,
        );
        setEmails("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to invite");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label htmlFor="invite-emails">Customer emails</Label>
        <Textarea
          id="invite-emails"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          rows={4}
          placeholder="alex@example.com, sam@startup.io"
          className="mt-1 font-mono text-xs"
        />
      </div>
      <div>
        <Label htmlFor="invite-note">Personal note (optional)</Label>
        <Input
          id="invite-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          placeholder="Thanks for trying us in beta - would love your honest take."
          className="mt-1"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending..." : "Send invites"}
        </Button>
        {result ? <span className="text-xs text-green-700">{result}</span> : null}
        {error ? <span className="text-xs text-red-600">{error}</span> : null}
      </div>
    </form>
  );
}
