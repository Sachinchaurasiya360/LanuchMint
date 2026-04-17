import Link from "next/link";
import { ArrowRight, Globe, LineChart, Rocket, Star } from "lucide-react";
import { Button, Card, CardContent } from "@launchmint/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const PILLARS = [
  {
    icon: Rocket,
    title: "Launch in a day",
    body: "A repeatable launch-day format with countdown, embeds, and a built-in checklist.",
  },
  {
    icon: Star,
    title: "Verified reviews",
    body: "Founders, customers, and investors leave reviews under their real identity.",
  },
  {
    icon: Globe,
    title: "Programmatic SEO",
    body: "Auto-generated product, founder, and category pages with JSON-LD baked in.",
  },
  {
    icon: LineChart,
    title: "Backlinks + rankings",
    body: "Track your backlinks, keyword positions, and verified MRR all in one place.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="mb-4 inline-block rounded-full border bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wide">
            SEO-first launch platform
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Turn visibility into velocity.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Launch your product, collect verified reviews, build your founder
            identity, and rank in search — all from one workspace built for solo
            founders.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signin">Get started free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">
                See pricing <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <Card key={p.title}>
                <CardContent className="p-6">
                  <p.icon className="h-6 w-6" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
