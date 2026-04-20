import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Globe,
  LineChart,
  Rocket,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { db } from "@launchmint/db";
import { Button, Card, CardContent } from "@launchmint/ui";
import {
  faqJsonLd,
  howToJsonLd,
  renderJsonLd,
} from "@launchmint/seo-meta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CATEGORIES, categorySlug } from "@/lib/categories";

export const revalidate = 300;

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

const HOW_IT_WORKS = [
  {
    name: "Claim your founder profile",
    text: "Sign in with Google, pick a slug, and fill in your bio. Your /founders/slug page goes live immediately with Person schema baked in.",
  },
  {
    name: "Ship a launch-day page",
    text: "Create a product, pick a launch date, and LaunchMint generates a countdown, an embed kit, and a review collection link. Launch day shows up on /today.",
  },
  {
    name: "Submit to 200+ directories",
    text: "LaunchMint auto-submits to API-enabled directories and hands you a one-click kit for the rest. Every submission is tracked in your dashboard.",
  },
  {
    name: "Rank in search and AI answers",
    text: "Every page ships with schema, canonical URLs, and entries in our sharded sitemap. An llms.txt index tells ChatGPT, Claude, and Perplexity where to cite you.",
  },
];

const FAQS = [
  {
    question: "What does LaunchMint actually do?",
    answer:
      "LaunchMint is a launch platform for indie founders. You ship a product page, pick a launch day, collect verified reviews, submit to 200+ directories automatically, and track your keyword rankings and backlinks - all from one workspace.",
  },
  {
    question: "How is this different from Product Hunt?",
    answer:
      "Product Hunt is a single launch day. LaunchMint gives you a permanent SEO-optimized product page, a founder profile with verified MRR, directory submission automation, and review collection that survives past launch day. Think Product Hunt + BetaList + SEO pSEO all in one.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. The Free plan covers one product, one launch, a founder profile, and review collection. Upgrade when you outgrow it. No credit card required to start.",
  },
  {
    question: "Do AI search engines find my product?",
    answer:
      "Yes. LaunchMint publishes an llms.txt index and explicitly allow-lists GPTBot, ClaudeBot, PerplexityBot, and Google-Extended in robots.txt. Your product page is retrievable from ChatGPT Search, Perplexity, Claude web, and Google AI Overviews.",
  },
];

async function getFeatured() {
  try {
    const [featured, counts] = await Promise.all([
      db.product.findMany({
        where: { status: "LIVE", deletedAt: null },
        orderBy: [{ launchScore: "desc" }, { publishedAt: "desc" }],
        select: {
          id: true,
          slug: true,
          name: true,
          tagline: true,
          category: true,
          launchScore: true,
        },
        take: 6,
      }),
      db.product.count({ where: { status: "LIVE", deletedAt: null } }),
    ]);
    return { featured, total: counts };
  } catch {
    return { featured: [] as Array<{
      id: string;
      slug: string;
      name: string;
      tagline: string;
      category: string;
      launchScore: number;
    }>, total: 0 };
  }
}

export default async function HomePage() {
  const { featured, total } = await getFeatured();

  const jsonLd = [
    howToJsonLd({
      name: "How to launch your product with LaunchMint",
      description:
        "Four steps to go from idea to ranked launch - founder profile, launch day, directory submissions, and AI discoverability.",
      totalTime: "PT30M",
      steps: HOW_IT_WORKS.map((s) => ({ name: s.name, text: s.text })),
    }),
    faqJsonLd(FAQS),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLd(jsonLd) }}
        />

        <section className="relative overflow-hidden border-b bg-background">
          {/* Ambient gradients */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[640px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,theme(colors.yellow.200/0.55),transparent_70%)] blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-24 -z-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,theme(colors.sky.200/0.5),transparent_70%)] blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 right-0 -z-10 h-[360px] w-[360px] rounded-full bg-[radial-gradient(closest-side,theme(colors.fuchsia.200/0.4),transparent_70%)] blur-2xl"
          />
          {/* Dotted grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(theme(colors.foreground/0.08)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
          />

          <div className="mx-auto grid max-w-6xl gap-16 px-4 pb-24 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:pb-32 lg:pt-28">
            {/* LEFT: Copy */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Turn visibility into velocity.
              </p>

              <h1 className="mt-5 text-[44px] font-semibold leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-[84px]">
                <span className="block">
                  Get <span className="font-semibold">ranked</span>,
                </span>
                <span className="mt-2 block">
                  <span className="relative inline-block">
                    <span className="relative z-10">reviewed</span>
                    <span
                      aria-hidden
                      className="absolute inset-x-[-4px] bottom-1 z-0 h-[18px] -rotate-1 bg-yellow-300"
                    />
                  </span>
                  , and{" "}
                  <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                    cited
                  </span>
                  .
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
                LaunchMint turns a single launch day into a permanent growth
                engine. Ship an SEO-ready product page, collect verified reviews,
                auto-submit to 200+ directories, and get cited by ChatGPT,
                Claude, and Perplexity.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="group h-12 px-6 text-base shadow-[0_8px_24px_-8px_theme(colors.foreground/0.4)]"
                >
                  <Link href="/signin">
                    Launch your product
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 border-foreground/15 bg-background/60 px-5 text-base backdrop-blur hover:bg-background"
                >
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </div>

              {/* Social proof row */}
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                <div className="flex -space-x-2">
                  {[
                    "from-orange-400 to-pink-500",
                    "from-sky-400 to-indigo-500",
                    "from-emerald-400 to-teal-500",
                    "from-fuchsia-400 to-purple-500",
                    "from-amber-400 to-red-500",
                  ].map((g, i) => (
                    <span
                      key={i}
                      aria-hidden
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${g} text-[11px] font-semibold text-white ring-2 ring-background`}
                    >
                      {["AK", "JM", "RS", "LT", "EV"][i]}
                    </span>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span className="ml-1 font-medium">4.9</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Loved by 50+ founders shipping every week
                  </p>
                </div>
                <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Free forever · no credit card
                </div>
              </div>
            </div>

            {/* RIGHT: Product preview mock */}
            <div className="relative lg:pl-6">
              {/* Floating accent: indexed-by */}
              <div className="absolute -left-6 -top-6 z-20 hidden items-center gap-2 rounded-xl border bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur md:flex">
                <Zap className="h-3.5 w-3.5 text-yellow-500" />
                <span className="font-medium">Indexed by</span>
                <span className="font-mono text-muted-foreground">
                  Google · ChatGPT · Perplexity
                </span>
              </div>

              {/* Floating accent: MRR */}
              <div className="absolute -right-4 top-24 z-20 hidden rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur md:block">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Verified MRR
                </p>
                <p className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-xl font-semibold tracking-tight">
                    $14,280
                  </span>
                  <span className="text-xs font-medium text-emerald-600">
                    +32%
                  </span>
                </p>
              </div>

              {/* Main mock card */}
              <div className="relative overflow-hidden rounded-2xl border bg-background shadow-[0_30px_60px_-20px_theme(colors.foreground/0.25)] ring-1 ring-foreground/5">
                {/* window chrome */}
                <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  <div className="ml-3 flex-1 truncate rounded-md bg-background px-2 py-1 text-[11px] font-mono text-muted-foreground">
                    launchmint.com/products/
                    <span className="text-foreground">your-saas</span>
                  </div>
                </div>

                {/* mock product page */}
                <div className="space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-foreground text-sm font-bold text-background">
                      YS
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold">
                          Your SaaS
                        </h3>
                        <span className="text-[10px] font-medium text-emerald-600">
                          ● LIVE
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        The fastest way to ship, rank, and grow your SaaS.
                      </p>
                    </div>
                    <div className="flex flex-col items-center rounded-lg border px-2 py-1">
                      <ArrowUpRight className="h-3 w-3" />
                      <span className="text-xs font-semibold">248</span>
                    </div>
                  </div>

                  {/* metrics grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { k: "#3", v: "Rank" },
                      { k: "92", v: "Score" },
                      { k: "47", v: "Reviews" },
                    ].map((m) => (
                      <div
                        key={m.v}
                        className="rounded-lg border bg-muted/30 px-2 py-2"
                      >
                        <p className="text-base font-semibold tracking-tight">
                          {m.k}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {m.v}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* chart */}
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Traffic — last 30 days
                      </span>
                      <span className="text-emerald-600">+214%</span>
                    </div>
                    <svg
                      viewBox="0 0 200 48"
                      className="mt-2 h-12 w-full"
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <defs>
                        <linearGradient id="lm-grad" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#FACC15" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,40 L15,38 L30,36 L45,34 L60,30 L75,32 L90,26 L105,22 L120,18 L135,20 L150,12 L165,8 L180,6 L200,2 L200,48 L0,48 Z"
                        fill="url(#lm-grad)"
                      />
                      <path
                        d="M0,40 L15,38 L30,36 L45,34 L60,30 L75,32 L90,26 L105,22 L120,18 L135,20 L150,12 L165,8 L180,6 L200,2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-foreground"
                      />
                    </svg>
                  </div>

                  {/* directory chips */}
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Submitted to
                    </span>
                    <div className="flex gap-1.5 text-[10px]">
                      {["ProductHunt", "BetaList", "SaaSHub", "+197"].map(
                        (d) => (
                          <span
                            key={d}
                            className="rounded border bg-background px-1.5 py-0.5 font-mono text-muted-foreground"
                          >
                            {d}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo strip */}
          <div className="relative border-t bg-muted/20">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span>As seen in</span>
              {["TechCrunch", "Hacker News", "Indie Hackers", "Reddit", "Dev.to"].map(
                (name) => (
                  <span key={name} className="font-sans tracking-normal">
                    {name}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        {/* FEATURE BENTO */}
        <section
          aria-label="Features"
          className="mx-auto max-w-6xl px-4 py-24"
        >
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              What&apos;s inside
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              One workspace. Every lever that moves a launch.
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Most launches die the day after launch day. LaunchMint keeps the
              flywheel spinning — SEO, reviews, distribution, rankings, all
              compounding in the background.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-6 lg:grid-rows-2">
            {/* Big card: Launch day */}
            <div className="group relative overflow-hidden rounded-2xl border bg-background p-6 lg:col-span-4 lg:row-span-1">
              <div className="flex items-start justify-between gap-6">
                <div className="max-w-sm">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                    <Rocket className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">
                    Launch in a day — not a week
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    A repeatable launch-day format with countdown, embeds,
                    checklist, and an always-on product page that keeps
                    converting long after the hype dies.
                  </p>
                </div>
                <div className="hidden shrink-0 sm:block">
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Launching in
                    </p>
                    <div className="mt-2 flex items-end gap-1.5 font-mono">
                      {[
                        { n: "02", l: "DAYS" },
                        { n: "14", l: "HRS" },
                        { n: "37", l: "MIN" },
                      ].map((c) => (
                        <div
                          key={c.l}
                          className="rounded-md border bg-background px-2 py-1 text-center"
                        >
                          <p className="text-base font-semibold leading-none">
                            {c.n}
                          </p>
                          <p className="mt-1 text-[9px] tracking-wider text-muted-foreground">
                            {c.l}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-[radial-gradient(closest-side,theme(colors.yellow.200/0.35),transparent_70%)] blur-2xl"
              />
            </div>

            {/* Verified reviews */}
            <div className="relative overflow-hidden rounded-2xl border bg-background p-6 lg:col-span-2 lg:row-span-1">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                <Star className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                Verified reviews
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Real users, real identities, eligible for rich-result stars.
              </p>
              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="ml-1 text-sm font-semibold">4.9</span>
              </div>
            </div>

            {/* pSEO */}
            <div className="relative overflow-hidden rounded-2xl border bg-background p-6 lg:col-span-2 lg:row-span-1">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                <Globe className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                Programmatic SEO
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Product, founder, and category pages auto-generated with
                JSON-LD, canonicals, and sharded sitemaps.
              </p>
              <div className="mt-4 flex flex-wrap gap-1 text-[10px] font-mono text-muted-foreground">
                {[
                  "/products",
                  "/founders",
                  "/best",
                  "/categories",
                  "/launches",
                ].map((p) => (
                  <span
                    key={p}
                    className="rounded border bg-muted/30 px-1.5 py-0.5"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Rankings */}
            <div className="relative overflow-hidden rounded-2xl border bg-background p-6 lg:col-span-4 lg:row-span-1">
              <div className="flex items-start justify-between gap-6">
                <div className="max-w-sm">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                    <LineChart className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">
                    Rankings, backlinks, MRR — tracked
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Keyword positions, referring domains, and verified MRR
                    updated daily. Spot the trend before it&apos;s a cliff.
                  </p>
                </div>
                <div className="hidden min-w-[180px] shrink-0 rounded-xl border bg-muted/30 p-3 sm:block">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium">Keyword rank</span>
                    <span className="font-mono text-emerald-600">▲ 12</span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {[
                      { k: "ai launch tool", r: "#2" },
                      { k: "indie saas directory", r: "#4" },
                      { k: "product launch seo", r: "#7" },
                    ].map((row) => (
                      <div
                        key={row.k}
                        className="flex items-center justify-between rounded-md bg-background px-2 py-1 text-[11px]"
                      >
                        <span className="truncate text-muted-foreground">
                          {row.k}
                        </span>
                        <span className="font-mono font-semibold">{row.r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute -left-24 -bottom-24 h-60 w-60 rounded-full bg-[radial-gradient(closest-side,theme(colors.sky.200/0.4),transparent_70%)] blur-2xl"
              />
            </div>
          </div>
        </section>

        {/* LAUNCHING TODAY — leaderboard */}
        <section className="relative border-y bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <span className="mr-2 inline-flex h-1.5 w-1.5 translate-y-[-1px] animate-pulse rounded-full bg-emerald-500 align-middle" />
                  Live leaderboard
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Launching today
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Fresh launches ranked by launch score — a blend of upvotes,
                  verified reviews, and early traction.
                </p>
              </div>
              <Link
                href="/today"
                className="group inline-flex items-center gap-1 text-sm font-medium"
              >
                See the full leaderboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {featured.length === 0 ? (
              <div className="mt-10 rounded-2xl border bg-background p-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No products in the spotlight yet. Be the first —{" "}
                  <Link href="/signin" className="font-medium underline">
                    launch yours
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <ol className="mt-10 overflow-hidden rounded-2xl border bg-background shadow-sm">
                {featured.map((p, i) => (
                  <li
                    key={p.id}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40"
                  >
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-lg text-sm font-bold ${
                        i === 0
                          ? "bg-yellow-300 text-foreground"
                          : i === 1
                            ? "bg-foreground/10 text-foreground"
                            : i === 2
                              ? "bg-orange-200 text-foreground"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${p.slug}`}
                          className="truncate text-base font-semibold hover:underline"
                        >
                          {p.name}
                        </Link>
                        <Link
                          href={`/categories/${categorySlug(p.category)}`}
                          className="hidden text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground sm:inline"
                        >
                          · {p.category}
                        </Link>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                        {p.tagline}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm">
                      <TrendingUp
                        className="h-3.5 w-3.5 text-emerald-600"
                        aria-hidden
                      />
                      <span className="font-mono font-semibold">
                        {p.launchScore}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="mx-auto max-w-6xl px-4 py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Browse
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Top categories
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Curated, SEO-optimized "Best of" pages — every one ranked, every
                one indexable.
              </p>
            </div>
            <Link
              href="/categories"
              className="group inline-flex items-center gap-1 text-sm font-medium"
            >
              All categories
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.slice(0, 8).map((c, i) => (
              <Link
                key={c}
                href={`/best/${categorySlug(c)}`}
                className="group relative flex flex-col justify-between bg-background p-5 transition-colors hover:bg-muted/30"
              >
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-3 text-base font-semibold tracking-tight">
                    Best {c.toLowerCase()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Top-ranked this week
                  </p>
                </div>
                <ArrowUpRight
                  className="mt-6 h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="relative overflow-hidden border-y bg-foreground text-background">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,theme(colors.yellow.300/0.18),transparent_70%)] blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,theme(colors.background/0.05)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.background/0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
          />

          <div className="relative mx-auto max-w-6xl px-4 py-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-background/60">
                  How it works
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                  Four steps.
                  <br />
                  <span className="text-background/60">
                    Roughly thirty minutes.
                  </span>
                </h2>
              </div>
              <p className="max-w-sm text-sm text-background/70">
                Set it up once — LaunchMint runs in the background,
                submitting to directories, tracking rankings, and collecting
                reviews for you.
              </p>
            </div>

            <ol className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((step, i) => (
                <li
                  key={step.name}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-background/10 bg-background/[0.04] p-6 transition-colors hover:bg-background/[0.08]"
                >
                  {/* step number watermark */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-3 -top-4 font-mono text-[120px] font-bold leading-none text-background/5 transition-colors group-hover:text-background/10"
                  >
                    {i + 1}
                  </span>

                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-300">
                    <span className="font-mono text-background/60">
                      Step {String(i + 1).padStart(2, "0")}
                    </span>
                    {i < HOW_IT_WORKS.length - 1 && (
                      <span
                        aria-hidden
                        className="hidden h-px flex-1 bg-background/10 lg:block"
                      />
                    )}
                  </div>

                  <h3 className="relative mt-8 text-xl font-semibold leading-snug tracking-tight">
                    {step.name}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-background/70">
                    {step.text}
                  </p>

                  <div className="relative mt-6 flex items-center gap-2 text-xs text-yellow-300">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-yellow-300" />
                    <span className="font-medium tracking-wide">
                      {
                        [
                          "Takes under 2 minutes",
                          "Goes live instantly",
                          "Runs in the background",
                          "Updated every 24h",
                        ][i]
                      }
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ — accordion */}
        <section className="mx-auto max-w-5xl px-4 py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                FAQ
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Questions,
                <br />
                answered.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Can&apos;t find what you&apos;re looking for?{" "}
                <a
                  href="mailto:support@launchmint.com"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Email us
                </a>
                .
              </p>
            </div>

            <dl className="divide-y rounded-2xl border bg-background">
              {FAQS.map((f) => (
                <details
                  key={f.question}
                  className="group px-5 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-medium">
                    <span>{f.question}</span>
                    <span
                      aria-hidden
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full border text-muted-foreground transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <dd className="pb-5 pr-10 text-sm text-muted-foreground">
                    {f.answer}
                  </dd>
                </details>
              ))}
            </dl>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
