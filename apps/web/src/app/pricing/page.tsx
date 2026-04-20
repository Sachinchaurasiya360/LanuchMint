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
import {
  buildMetadata,
  faqJsonLd,
  offerProductJsonLd,
  renderJsonLd,
} from "@launchmint/seo-meta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const ORDER = ["FREE", "STARTER", "GROWTH"] as const;
const POPULAR_PLAN = "GROWTH";

const PLAN_TAGLINES: Record<(typeof ORDER)[number], string> = {
  FREE: "Claim your founder profile and ship your first launch.",
  STARTER: "For founders launching their first real product.",
  GROWTH: "For founders who want to rank, get reviewed, and get cited.",
};

const FAQS = [
  {
    question: "Is there a free plan?",
    answer:
      "Yes. The Free plan lets you claim a founder profile, launch one product, and collect reviews. No credit card required.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel from the billing page and you keep paid features until the end of the current billing period. No questions, no retention calls.",
  },
  {
    question: "Do you offer a refund?",
    answer:
      "We refund any charge within 14 days if you're not happy. Email support@launchmint.com from the email on your account.",
  },
  {
    question: "How does SEO optimization work?",
    answer:
      "Every product page ships with structured data (SoftwareApplication, Review, Breadcrumb), canonical URLs, and an entry in our segmented sitemap. Paid plans add directory submission automation and keyword rank tracking.",
  },
  {
    question: "Can I submit my product to multiple directories?",
    answer:
      "Yes. LaunchMint tracks 200+ directories and submits to compatible ones via API on Growth and above. Manual-only directories show a one-click copy-to-clipboard kit.",
  },
  {
    question: "What counts as a verified review?",
    answer:
      "Reviews collected via a LaunchMint review link tied to a customer email we've verified. Verified reviews display a badge and are eligible for structured-data rich results.",
  },
];

export const metadata = buildMetadata({
  title: "Pricing - LaunchMint",
  description:
    "Simple, transparent pricing for LaunchMint. Start free, upgrade when you outgrow it. Cancel anytime.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Pricing
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            One launch today.
            <br />
            A growth engine forever.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
            Start free, launch the same day, and only upgrade when the extra
            directories, reviews, and AI citations start paying for themselves.
            Cancel anytime.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3">
          {ORDER.map((id) => {
            const plan = PLANS[id];
            const isPopular = id === POPULAR_PLAN;
            return (
              <div key={id} className="relative">
                {isPopular && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-b from-yellow-300/50 to-yellow-500/40 blur-sm"
                  />
                )}
                <Card
                  className={`relative flex h-full flex-col ${
                    isPopular
                      ? "border-foreground/20 ring-1 ring-foreground/10 shadow-[0_20px_50px_-20px_theme(colors.foreground/0.25)]"
                      : ""
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
                      <span className="inline-flex items-center gap-1 rounded-md bg-yellow-300 px-2.5 py-1 shadow-sm">
                        Most popular
                      </span>
                    </div>
                  )}

                  <CardHeader className="space-y-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {PLAN_TAGLINES[id]}
                    </p>
                    <CardDescription className="pt-2">
                      <span className="text-4xl font-semibold tracking-tight text-foreground">
                        ${plan.priceMonthlyUsd}
                      </span>
                      <span className="ml-1 text-sm text-muted-foreground">
                        /month
                      </span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col">
                    <Button
                      asChild
                      variant={isPopular ? "default" : "outline"}
                      className="w-full"
                    >
                      <Link
                        href={plan.id === "FREE" ? "/signin" : "/app/billing"}
                      >
                        {plan.id === "FREE"
                          ? "Start free"
                          : `Get ${plan.name}`}
                      </Link>
                    </Button>

                    <div className="mt-6 border-t pt-5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        What you get
                      </p>
                      <ul className="mt-3 space-y-2.5 text-sm">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5">
                            <span
                              className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                                isPopular
                                  ? "bg-yellow-300 text-foreground"
                                  : "bg-foreground/5 text-foreground"
                              }`}
                            >
                              <Check className="h-3 w-3" aria-hidden />
                            </span>
                            <span className="leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted-foreground">
          All plans include: SEO-ready pages, JSON-LD schema, canonical URLs,
          sharded sitemap, and allow-listed AI crawlers.
        </p>

        <section className="mx-auto mt-24 max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <dl className="mt-8 space-y-6">
            {FAQS.map((f) => (
              <div key={f.question}>
                <dt className="text-base font-medium">{f.question}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  {f.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderJsonLd([
            faqJsonLd(FAQS),
            ...ORDER.map((id) => {
              const plan = PLANS[id];
              return offerProductJsonLd({
                name: `${plan.name} plan`,
                description: plan.features.join(" · "),
                price: plan.priceMonthlyUsd,
                currency: "USD",
                url: "/pricing",
                features: plan.features,
              });
            }),
          ]),
        }}
      />
    </div>
  );
}
