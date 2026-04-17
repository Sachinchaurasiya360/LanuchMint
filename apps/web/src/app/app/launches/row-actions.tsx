"use client";

import { useTransition } from "react";
import { Button } from "@launchmint/ui";
import { cancelLaunchAction, recomputeReadinessAction } from "./actions";

export function CancelLaunchButton({ launchId }: { launchId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Cancel this scheduled launch?")) return;
        startTransition(async () => {
          await cancelLaunchAction(launchId);
        });
      }}
    >
      {isPending ? "Cancelling..." : "Cancel"}
    </Button>
  );
}

export function RecomputeReadinessButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await recomputeReadinessAction(productId);
        });
      }}
    >
      {isPending ? "Scoring..." : "Re-score"}
    </Button>
  );
}
