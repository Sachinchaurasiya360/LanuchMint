import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Star, TrendingUp } from "lucide-react";
import { db } from "@launchmint/db";
import { Badge } from "@launchmint/ui";
import {
  breadcrumbJsonLd,
  buildMetadata,
  collectionPageJsonLd,
  renderJsonLd,
} from "@launchmint/seo-meta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  CATEGORIES,
  categoryFromSlug,
  categorySlug,
  type Category,
} from "@/lib/categories";

export const revalidate = 3600;
export const dynamicParams = true;

type Params = { category: string };

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: categorySlug(c) }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const category = categoryFromSlug(params.category);
  if (!category) return { title: "Not found" };
  const year = new Date().getUTCFullYear();
  return buildMetadata({
    title: `Best ${category.toLowerCase()} startups of ${year}`,
    description: `Top-ranked ${category.toLowerCase()} products on LaunchMint - scored by community upvotes, verified reviews, and launch trust score.`,
    path: `/best/${params.category}`,
  });
}

export default async function BestOfPage({ params }: { params: Params }) {
  const category = categoryFromSlug(params.category);
  if (!category) notFound();

  const ranked = await loadRanked(category);

  const year = new Date().getUTCFullYear();

  const jsonLd = [
    collectionPageJsonLd({
      name: `Best ${category} startups of ${year}`,
      description: `Top-ranked ${category.toLowerCase()} products on LaunchMint.`,
      url: `/best/${params.category}`,
      items: ranked.map((p) => ({
        name: p.name,
        url: `/products/${p.slug}`,
      })),
    }),
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Best", url: `/best/${params.category}` },
      { name: category, url: `/best/${params.category}` },
    ]),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(jsonLd) }}
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <Breadcrumbs
          items={[
            { name: "Best", url: `/best/${params.category}` },
            { name: category, url: `/best/${params.category}` },
          ]}
        />
        <header className="mt-4">
          <p className="text-xs uppercase text-muted-foreground">Best of</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Best {category.toLowerCase()} startups of {year}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Ranked by a blended score of community upvotes, published review
            averages, and launch-day trust. Updated hourly.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            <Link href={`/categories/${params.category}`} className="underline">
              See every {category.toLowerCase()} product →
            </Link>
          </p>
        </header>

        {ranked.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No qualifying products yet - check back soon.
          </p>
        ) : (
          <ol className="mt-8 space-y-4">
            {ranked.map((p, i) => (
              <li
                key={p.id}
                className="flex items-start gap-4 rounded-lg border p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-secondary/40 text-base font-semibold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/products/${p.slug}`}
                    className="text-base font-semibold hover:underline"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.tagline}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {p.reviewCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <Star className="h-3 w-3" fill="currentColor" />
                        {p.ratingValue.toFixed(1)} · {p.reviewCount}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {p.upvoteCount} upvotes
                    </span>
                    {p.hasVerifiedMrr ? (
                      <Badge variant="secondary" className="gap-1">
                        <ShieldCheck className="h-3 w-3" /> Verified MRR
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

interface Ranked {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  upvoteCount: number;
  reviewCount: number;
  ratingValue: number;
  score: number;
  hasVerifiedMrr: boolean;
}

async function loadRanked(category: Category): Promise<Ranked[]> {
  const products = await db.product.findMany({
    where: { category, status: "LIVE", deletedAt: null },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      trustScore: true,
      launchScore: true,
    },
    take: 300,
  });
  if (products.length === 0) return [];

  const ids = products.map((p) => p.id);
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
      select: { productId: true },
      distinct: ["productId"],
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
  const mrrSet = new Set(mrr.map((m) => m.productId));

  const scored: Ranked[] = products.map((p) => {
    const uv = upvoteMap.get(p.id) ?? 0;
    const r = reviewMap.get(p.id);
    const count = r?.count ?? 0;
    const avg = r?.avg ?? 0;
    const score =
      uv * 1 +
      count * avg * 2 +
      (p.trustScore ?? 0) * 0.5 +
      (p.launchScore ?? 0) * 0.1 +
      (mrrSet.has(p.id) ? 10 : 0);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      upvoteCount: uv,
      reviewCount: count,
      ratingValue: avg,
      score,
      hasVerifiedMrr: mrrSet.has(p.id),
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 25);
}
