"use client";

import { useState, useTransition } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { Badge, Button, Input } from "@launchmint/ui";
import {
  addTrackedKeywordAction,
  refreshSeoSnapshotAction,
  removeTrackedKeywordAction,
  suggestKeywordsAction,
} from "./actions";

interface Props {
  productId: string;
  productName: string;
  keywords: string[];
}

interface Suggestion {
  keyword: string;
  intent: string;
  rationale: string;
}

export function KeywordControls({ productId, productName, keywords }: Props) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingAdd, addTransition] = useTransition();
  const [pendingSuggest, suggestTransition] = useTransition();
  const [pendingRefresh, refreshTransition] = useTransition();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium">Tracked keywords · {productName}</h3>
        <Button
          size="sm"
          variant="ghost"
          disabled={pendingRefresh}
          onClick={() =>
            refreshTransition(async () => {
              setError(null);
              try {
                await refreshSeoSnapshotAction(productId);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed");
              }
            })
          }
        >
          {pendingRefresh ? "Refreshing..." : "Refresh snapshot"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pendingSuggest}
          onClick={() =>
            suggestTransition(async () => {
              setError(null);
              try {
                const items = await suggestKeywordsAction(productId);
                setSuggestions(items as Suggestion[]);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed");
              }
            })
          }
        >
          <Sparkles className="h-3 w-3" />
          {pendingSuggest ? "Thinking..." : "Suggest keywords"}
        </Button>
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const kw = input.trim();
          if (!kw) return;
          addTransition(async () => {
            setError(null);
            try {
              await addTrackedKeywordAction({ productId, keyword: kw });
              setInput("");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed");
            }
          });
        }}
      >
        <Input
          placeholder="e.g. ai resume builder"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full max-w-xs"
        />
        <Button type="submit" size="sm" disabled={pendingAdd || !input.trim()}>
          <Plus className="h-3 w-3" />
          {pendingAdd ? "Adding..." : "Track"}
        </Button>
      </form>

      {keywords.length === 0 ? (
        <p className="text-sm text-muted-foreground">No keywords yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {keywords.map((k) => (
            <li key={k}>
              <Badge variant="secondary" className="gap-1 pr-1">
                {k}
                <button
                  type="button"
                  aria-label={`Remove ${k}`}
                  className="rounded p-0.5 hover:bg-background"
                  onClick={() =>
                    addTransition(async () => {
                      await removeTrackedKeywordAction({
                        productId,
                        keyword: k,
                      }).catch(() => {});
                    })
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}

      {suggestions && suggestions.length > 0 ? (
        <div className="rounded-md border p-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Suggested
          </p>
          <ul className="mt-2 space-y-2">
            {suggestions.map((s) => (
              <li key={s.keyword} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{s.keyword}</span>{" "}
                    <span className="text-xs text-muted-foreground">
                      · {s.intent}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{s.rationale}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    addTransition(async () => {
                      await addTrackedKeywordAction({
                        productId,
                        keyword: s.keyword,
                      }).catch(() => {});
                    })
                  }
                >
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
