import Link from "next/link";
import { Check } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@launchmint/ui";
import { PLANS } from "@launchmint/billing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const ORDER = ["FREE", "STARTER", "GROWTH", "PRO", "AGENCY"] as const;

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Start free. Upgrade when you outgrow it. Cancel anytime.
          </p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-5">
          {ORDER.map((id) => {
            const plan = PLANS[id];
            return (
              <Card key={id}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-semibold text-foreground">
                      ${plan.priceMonthlyUsd}
                    </span>
                    <span className="text-sm">/mo</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check
                          className="mt-0.5 h-4 w-4 text-foreground"
                          aria-hidden
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-6 w-full">
                    <Link href="/signin">
                      {plan.id === "FREE" ? "Start free" : "Choose plan"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
