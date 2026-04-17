"use client";

import { useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@launchmint/ui";
import { recommendDirectoriesAction } from "./actions";

export function RecommendButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await recommendDirectoriesAction(productId);
        })
      }
    >
      <Sparkles className="h-3.5 w-3.5" />
      {isPending ? "Scoring..." : "Refresh recommendations"}
    </Button>
  );
}
