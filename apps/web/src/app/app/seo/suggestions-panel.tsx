"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Badge, Button } from "@launchmint/ui";
import { generateSeoSuggestionsAction } from "./actions";

interface Suggestion {
  area: "on_page" | "technical" | "content" | "backlinks";
  title: string;
  action: string;
  priority: "high" | "medium" | "low";
}

export function SeoSuggestionsPanel({ productId }: { productId: string }) {
  const [items, setItems] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              try {
                const res = await generateSeoSuggestionsAction(productId);
                setItems(res as Suggestion[]);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed");
              }
            })
          }
        >
          <Sparkles className="h-3 w-3" />
          {pending ? "Analyzing..." : "AI: suggest SEO wins"}
        </Button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {items && items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((s, i) => (
            <li key={i} className="rounded-md border p-3">
              <div className="flex items-center gap-2">
                <Badge variant={s.priority === "high" ? "default" : "secondary"}>
                  {s.priority}
                </Badge>
                <span className="text-xs uppercase text-muted-foreground">
                  {s.area.replace("_", " ")}
                </span>
                <span className="text-sm font-medium">{s.title}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{s.action}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
