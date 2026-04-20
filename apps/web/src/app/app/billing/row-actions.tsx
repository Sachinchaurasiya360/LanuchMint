"use client";

import { useState, useTransition } from "react";
import { Button } from "@launchmint/ui";
import { cancelSubscriptionAction } from "./actions";

export function CancelSubscriptionButton({ disabled }: { disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        disabled={pending || disabled}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            try {
              await cancelSubscriptionAction();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed");
            }
          })
        }
      >
        {disabled ? "Cancel scheduled" : pending ? "Cancelling..." : "Cancel at period end"}
      </Button>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
