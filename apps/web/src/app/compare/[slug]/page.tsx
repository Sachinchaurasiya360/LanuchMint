import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { db } from "@launchmint/db";
import { Badge } from "@launchmint/ui";
import {
  breadcrumbJsonLd,
  buildMetadata,
  renderJsonLd,
} from "@launchmint/seo-meta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const revalidate = 3600;
export const dynamicParams = true;

const MIN_DESCRIPTION_CHARS = 120;

type Params = { slug: string };

function parsePair(slug: string): [string, string] | null {
  const match = slug.match(/^(.+?)-vs-(.+)$/);
  if (!match) return null;
  const a = match[1];
  const b = match[2];
  if (!a || !b || a === b) return null;
  return [a, b];
}

async function loadPair(slugA: string, slugB: string) {
  const [a, b] = await Promise.all([
    loadProduct(slugA),
    loadProduct(slugB),
  ]);
  if (!a || !b) return null;
  if (!qualifies(a) || !qualifies(b)) return null;
  return { a, b };
}

async function loadProduct(slug: string) {
  return db.product.findFirst({
    where: { slug, status: "LIVE", deletedAt: null },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      description: true,
      category: true,
      industry: true,
      websiteUrl: true,
      logoUrl: true,
      pricingModel: true,
    },
  });
}

type CompareProduct = NonNullable<Awaited<ReturnType<typeof loadProduct>>>;

function qualifies(p: CompareProduct): boolean {
  return (p.description?.length ?? 0) >= MIN_DESCRIPTION_CHARS;
}

async function loadStats(ids: string[]) {
  const [upvotes, reviews, mrr] = await Promise.all([
    db.upvote.groupBy({
      by: ["productId"],
      where: { productId: { in: ids } },
      _count: { _all: true },
    }),
    db.review.groupBy({
      by: ["productId"],
      where: { productId: { in: ids }, status: "PUBLISHED", deletedAt: null },
      _count: { _all: true },
      _avg: { rating: true },
    }),
    db.mrrSnapshot.findMany({
      where: { productId: { in: ids }, source: "stripe" },
      orderBy: { capturedAt: "desc" },
      distinct: ["productId"],
      select: { productId: true, mrrCents: true, currency: true },
    }),
  ]);
  const upvoteMap = new Map<string, number>(
    upvotes.map((u) => [u.productId, u._count._all]),
  );
  const reviewMap = new Map<string, { count: number; avg: number }>(
    reviews.map((r) => [
      r.productId,
      { count: r._count._all, avg: r._avg.rating ?? 0 },
    ]),
  );
  const mrrMap = new Map<
    string,
    { productId: string; mrrCents: number; currency: string }
  >(mrr.map((m) => [m.productId, m]));
  return { upvoteMap, reviewMap, mrrMap };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const pair = parsePair(params.slug);
  if (!pair) return { title: "Not found" };
  const loaded = await loadPair(pair[0], pair[1]);
  if (!loaded) return { title: "Not found" };
  const { a, b } = loaded;
  return buildMetadata({
    title: `${a.name} vs ${b.name} - head-to-head comparison`,
    description: `Compare ${a.name} and ${b.name} side-by-side: ratings, community upvotes, verified MRR, and pricing. Updated hourly on LaunchMint.`,
    path: `/compare/${params.slug}`,
  });
}

export default async function ComparePage({ params }: { params: Params }) {
  const pair = parsePair(params.slug);
  if (!pair) notFound();
  const loaded = await loadPair(pair[0], pair[1]);
  if (!loaded) notFound();

  const { a, b } = loaded;
  const { upvoteMap, reviewMap, mrrMap } = await loadStats([a.id, b.id]);

  const uvA = upvoteMap.get(a.id) ?? 0;
  const uvB = upvoteMap.get(b.id) ?? 0;
  const rA = reviewMap.get(a.id);
  const rB = reviewMap.get(b.id);
  const mrrA = mrrMap.get(a.id);
  const mrrB = mrrMap.get(b.id);

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Compare", url: `/compare/${params.slug}` },
      { name: `${a.name} vs ${b.name}`, url: `/compare/${params.slug}` },
    ]),
    comparisonJsonLd(params.slug, a, b),
  ];

  const rows: Array<{
    label: string;
    a: React.ReactNode;
    b: React.ReactNode;
  }> = [
    { label: "Tagline", a: a.tagline, b: b.tagline },
    {
      label: "Category",
      a: <Badge variant="secondary">{a.category}</Badge>,
      b: <Badge variant="secondary">{b.category}</Badge>,
    },
    { label: "Industry", a: a.industry ?? "-", b: b.industry ?? "-" },
    {
      label: "Community upvotes",
      a: `${uvA}`,
      b: `${uvB}`,
    },
    {
      label: "Average rating",
      a: rA ? `${rA.avg.toFixed(1)} (${rA.count})` : "-",
      b: rB ? `${rB.avg.toFixed(1)} (${rB.count})` : "-",
    },
    {
      label: "Verified MRR",
      a: mrrA ? (
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />$
          {(mrrA.mrrCents / 100).toLocaleString()}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
      b: mrrB ? (
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />$
          {(mrrB.mrrCents / 100).toLocaleString()}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      label: "Pricing model",
      a: a.pricingModel ?? "-",
      b: b.pricingModel ?? "-",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(jsonLd) }}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <header>
          <p className="text-xs uppercase text-muted-foreground">Compare</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {a.name} vs {b.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Side-by-side comparison drawn from LaunchMint community data.
            Verified MRR and review counts update daily.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {[a, b].map((p) => (
            <div key={p.id} className="rounded-lg border p-4">
              <Link
                href={`/products/${p.slug}`}
                className="text-lg font-semibold hover:underline"
              >
                {p.name}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
              <p className="mt-3 text-xs text-muted-foreground line-clamp-4">
                {p.description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3"> </th>
                <th className="px-4 py-3">{a.name}</th>
                <th className="px-4 py-3">{b.name}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t">
                  <td className="w-48 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                    {row.label}
                  </td>
                  <td className="px-4 py-3">{row.a}</td>
                  <td className="px-4 py-3">{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-8 text-xs text-muted-foreground">
          <p>
            Trying to decide?{" "}
            {rA && rB && rA.avg > rB.avg ? (
              <span>
                {a.name} has a higher average rating so far, but{" "}
                {b.name} has{" "}
                {uvB > uvA ? "more community upvotes" : "its own base of supporters"}.
              </span>
            ) : rA && rB && rB.avg > rA.avg ? (
              <span>
                {b.name} edges out on review average; {a.name} leads on{" "}
                {uvA > uvB ? "upvotes" : "launch trust"}.
              </span>
            ) : (
              <span>
                Both are early in their review cycle. Use community upvotes and
                verified MRR as your tie-breakers.
              </span>
            )}
          </p>
          <p className="mt-4">
            Want a different matchup?{" "}
            <Link href="/today" className="underline">
              Browse today's launches →
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function comparisonJsonLd(
  pairSlug: string,
  a: CompareProduct,
  b: CompareProduct,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pairSlug}#compare`,
    name: `${a.name} vs ${b.name}`,
    itemListElement: [a, b].map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `/products/${p.slug}`,
      item: {
        "@type": "SoftwareApplication",
        name: p.name,
        description: p.description,
        applicationCategory: p.category,
      },
    })),
  };
}
