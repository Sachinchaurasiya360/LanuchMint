import Link from "next/link";
import { Rocket, LineChart, Globe, Star } from "lucide-react";
import { buildMetadata } from "@launchmint/seo-meta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = buildMetadata({
  title: "About — LaunchMint",
  description:
    "LaunchMint is the launch platform for indie founders. We turn one launch day into a permanent growth engine — SEO, reviews, directories, and AI citations.",
  path: "/about",
});

const VALUES = [
  {
    icon: Rocket,
    title: "Ship, don't stall.",
    body: "Features exist when they're shipping value on day one. If it doesn't help a founder launch faster, it doesn't ship.",
  },
  {
    icon: Globe,
    title: "Indexable by default.",
    body: "Every page we build is SEO-ready out of the box — structured data, canonicals, sitemaps, AI crawlers allow-listed.",
  },
  {
    icon: Star,
    title: "Honest over hype.",
    body: "Verified reviews, verified MRR, real identities. We'd rather show real traction than inflate vanity numbers.",
  },
  {
    icon: LineChart,
    title: "Compounding, not campaigns.",
    body: "A launch day gets you a spike. A growth engine gets you a trend line. We build for the trend line.",
  },
];

const STATS = [
  { k: "200+", v: "Directories tracked" },
  { k: "50+", v: "Founders shipping" },
  { k: "4", v: "AI engines cite us" },
  { k: "$0", v: "To get started" },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[520px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,theme(colors.yellow.200/0.45),transparent_70%)] blur-2xl"
          />
          <div className="mx-auto max-w-4xl px-4 py-24 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              About LaunchMint
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
              We help indie founders
              <br />
              turn <span className="relative inline-block">
                <span className="relative z-10">visibility</span>
                <span
                  aria-hidden
                  className="absolute inset-x-[-4px] bottom-1 z-0 h-[14px] -rotate-1 bg-yellow-300"
                />
              </span>{" "}
              into{" "}
              <span className="font-semibold">velocity</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Most launches die the day after launch day. LaunchMint keeps the
              flywheel spinning — SEO-ready pages, verified reviews, directory
              submissions, and AI citations, all compounding in the background.
            </p>
          </div>
        </section>

        {/* Stats band */}
        <section className="border-b bg-muted/20">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
            {STATS.map((s) => (
              <div key={s.v} className="px-6 py-8 text-center">
                <p className="text-3xl font-semibold tracking-tight">{s.k}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="mx-auto max-w-5xl px-4 py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Our mission
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Give every solo founder an unfair distribution advantage.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                Big teams have growth hires, SEO specialists, and PR agencies.
                Solo founders have afternoons between bug fixes. That gap
                decides who wins.
              </p>
              <p>
                We built LaunchMint to close it. One workspace that handles the
                launch page, the reviews, the directory grind, the keyword
                tracking, and the AI-citation infrastructure — so you can spend
                your time on the product, not the promotion.
              </p>
              <p className="text-foreground">
                If you can ship code, you can ship a launch that actually
                ranks.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="border-y bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 py-24">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                What we believe
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Four principles we build every feature against.
              </h2>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {VALUES.map((v) => (
                <div
                  key={v.title}
                  className="rounded-2xl border bg-background p-6"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                    <v.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {v.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="mx-auto max-w-3xl px-4 py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            The story
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Built by founders who got tired of the launch-day cliff.
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              The first version of LaunchMint was a spreadsheet — a list of
              directories we were cold-submitting to for our own products.
              Every submission took 10 minutes. Half of them dropped us into
              the void.
            </p>
            <p>
              The second version was a crappy Chrome extension that pre-filled
              the forms. It worked. People asked if they could use it.
            </p>
            <p>
              The third version is this. A full launch OS — because getting
              your product in front of people shouldn&apos;t feel like a second
              full-time job.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border bg-muted/30 p-6">
            <p className="text-sm text-muted-foreground">Ready to ship?</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Launch free
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-10 items-center justify-center rounded-md border px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                See pricing
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
