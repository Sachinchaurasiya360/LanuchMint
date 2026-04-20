"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@launchmint/ui";
import { PLANS, type PlanId } from "@launchmint/billing/plans";
import { startSubscriptionAction } from "./actions";

const ORDER: PlanId[] = ["FREE", "STARTER", "GROWTH", "PRO", "AGENCY"];

export function PlanPicker({ currentPlan }: { currentPlan: PlanId }) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<PlanId | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border p-0.5 text-xs">
        <button
          type="button"
          className={
            billing === "monthly"
              ? "rounded bg-foreground px-3 py-1 text-background"
              : "px-3 py-1 text-muted-foreground"
          }
          onClick={() => setBilling("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          className={
            billing === "yearly"
              ? "rounded bg-foreground px-3 py-1 text-background"
              : "px-3 py-1 text-muted-foreground"
          }
          onClick={() => setBilling("yearly")}
        >
          Yearly · save 16%
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = id === currentPlan;
          const price =
            billing === "yearly" ? plan.priceYearlyUsd : plan.priceMonthlyUsd;
          return (
            <Card key={id} className={isCurrent ? "border-foreground" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {plan.name}
                  {isCurrent ? <Badge variant="secondary">current</Badge> : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  ${price}
                  <span className="text-sm text-muted-foreground">
                    /{billing === "yearly" ? "yr" : "mo"}
                  </span>
                </p>
                <ul className="mt-3 space-y-1.5 text-xs">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <Check className="mt-0.5 h-3 w-3" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {id === "FREE" ? null : (
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent || pendingId !== null}
                    onClick={() => {
                      setError(null);
                      setPendingId(id);
                      startTransition(async () => {
                        try {
                          await startSubscriptionAction({
                            plan: id,
                            billing,
                          });
                        } catch (err) {
                          setError(
                            err instanceof Error ? err.message : "Failed",
                          );
                          setPendingId(null);
                        }
                      });
                    }}
                  >
                    {isCurrent
                      ? "Current plan"
                      : pendingId === id
                        ? "Redirecting..."
                        : "Choose"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
