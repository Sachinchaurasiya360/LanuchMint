"use client";

import { useTransition } from "react";
import { Button } from "@launchmint/ui";

type Kind = "review" | "comment" | "product";

const LABELS: Record<Kind, { approve: string; remove: string }> = {
  review: { approve: "Publish", remove: "Remove" },
  comment: { approve: "Publish", remove: "Remove" },
  product: { approve: "Approve", remove: "Archive" },
};

export function ModerationRowActions({
  id,
  kind,
  decide,
}: {
  id: string;
  kind: Kind;
  decide: (id: string, decision: "approve" | "remove") => Promise<void>;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => start(() => decide(id, "approve"))}
      >
        {LABELS[kind].approve}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => start(() => decide(id, "remove"))}
      >
        {LABELS[kind].remove}
      </Button>
    </div>
  );
}
