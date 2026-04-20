import Link from "next/link";
import { CheckCircle2, CircleDollarSign, Sparkles } from "lucide-react";
import { db } from "@launchmint/db";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@launchmint/ui";
import {
  PLANS,
  summarizeUsage,
  usagePeriodFor,
  type PlanId,
} from "@launchmint/billing";
import { requireSession } from "@/lib/session";
import { PlanPicker } from "./plan-picker";
import { UsageBar } from "./usage-bar";
import { CancelSubscriptionButton } from "./row-actions";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { workspaceId } = await requireSession();

  const [subscription, usage, stripeIntegration] = await Promise.all([
    db.subscription.findUnique({ where: { workspaceId } }),
    db.usageCounter.findUnique({ where: { workspaceId } }),
    db.integration.findUnique({
      where: { workspaceId_type: { workspaceId, type: "STRIPE" } },
    }),
  ]);

  const plan: PlanId = subscription?.plan ?? "FREE";
  const period = usagePeriodFor(subscription?.currentPeriodStart ?? null);

  // Ensure a usage row exists so the first render shows zeros rather than -.
  if (!usage) {
    await db.usageCounter
      .create({
        data: {
          workspaceId,
          periodStart: period.start,
          periodEnd: period.end,
        },
      })
      .catch(() => {});
  }

  const rows = summarizeUsage(plan, {
    aiCreditsUsed: usage?.aiCreditsUsed ?? 0,
    seoChecksUsed: usage?.seoChecksUsed ?? 0,
    directorySubmissions: usage?.directorySubmissions ?? 0,
    reviewInvitesSent: usage?.reviewInvitesSent ?? 0,
    reportsExported: usage?.reportsExported ?? 0,
  });

  const current = PLANS[plan];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your plan, see usage against limits, and update payment.
        </p>
      </header>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Current plan ·{" "}
              <span>{current.name}</span>
              {subscription?.cancelAtPeriodEnd ? (
                <Badge variant="secondary">cancels at period end</Badge>
              ) : subscription?.status ? (
                <Badge variant="secondary">{subscription.status}</Badge>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Billing period:{" "}
              {period.start.toISOString().slice(0, 10)} →{" "}
              {period.end.toISOString().slice(0, 10)}
            </p>
            <div className="space-y-3">
              {rows.map((r) => (
                <UsageBar key={r.key} row={r} />
              ))}
            </div>
            {subscription?.razorpaySubId ? (
              <div className="pt-2">
                <CancelSubscriptionButton
                  disabled={subscription.cancelAtPeriodEnd}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {current.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <CircleDollarSign className="h-4 w-4" /> Verified MRR (Stripe
              Connect)
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Read-only. We only pull active subscription totals - we never
              charge through your Stripe.
            </p>
          </div>
          {stripeIntegration?.externalId ? (
            <Badge variant="secondary">
              Connected · {stripeIntegration.externalId.slice(0, 12)}…
            </Badge>
          ) : (
            <Button asChild size="sm">
              <a href="/api/v1/integrations/stripe/connect">Connect Stripe</a>
            </Button>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-muted-foreground">
          Change plan
        </h2>
        <div className="mt-3">
          <PlanPicker currentPlan={plan} />
        </div>
      </section>

      <p className="mt-10 text-xs text-muted-foreground">
        Receipts are emailed on renewal. For invoices or changes, email{" "}
        <Link href="mailto:billing@launchmint.io" className="underline">
          billing@launchmint.io
        </Link>
        .
      </p>
    </div>
  );
}
