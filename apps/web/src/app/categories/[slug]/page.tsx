import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
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
import {
  CATEGORIES,
  categoryFromSlug,
  categorySlug,
  type Category,
} from "@/lib/categories";

export const revalidate = 3600;
export const dynamicParams = true;

type Params = { slug: string };

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: categorySlug(c) }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const category = categoryFromSlug(params.slug);
  if (!category) return { title: "Not found" };
  return buildMetadata({
    title: `${category} startups - curated products on LaunchMint`,
    description: `Discover the best ${category.toLowerCase()} startups. Ratings, reviews, and verified MRR from the LaunchMint community.`,
    path: `/categories/${params.slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Params }) {
  const category = categoryFromSlug(params.slug);
  if (!category) notFound();

  const products = await loadCategoryProducts(category);

  const jsonLd = [
    collectionPageJsonLd({
      name: `${category} startups`,
      description: `Curated ${category.toLowerCase()} products on LaunchMint.`,
      url: `/categories/${params.slug}`,
      items: products.map((p) => ({
        name: p.name,
        url: `/products/${p.slug}`,
      })),
    }),
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Categories", url: "/categories" },
      { name: category, url: `/categories/${params.slug}` },
    ]),
  ];

  const relatedCategories = CATEGORIES.filter((c) => c !== category).slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(jsonLd) }}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Category</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              {category}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {products.length}{" "}
              {products.length === 1 ? "product" : "products"} on LaunchMint.
            </p>
          </div>
          <Link
            href={`/best/${params.slug}`}
            className="text-sm font-medium underline underline-offset-4"
          >
            Best {category.toLowerCase()} →
          </Link>
        </header>

        {products.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No products listed yet in this category.
          </p>
        ) : (
          <ul className="mt-8 divide-y rounded-lg border">
            {products.map((p) => (
              <li key={p.id} className="flex items-start gap-4 p-4">
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
                    {p.industry ? <Badge variant="secondary">{p.industry}</Badge> : null}
                    {p.reviewCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <Star className="h-3 w-3" fill="currentColor" />
                        {p.ratingValue.toFixed(1)} · {p.reviewCount}
                      </span>
                    ) : null}
                    <span>{p.upvoteCount} upvotes</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <section className="mt-12">
          <h2 className="text-sm font-medium text-muted-foreground">
            Browse other categories
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {relatedCategories.map((c) => (
              <li key={c}>
                <Link
                  href={`/categories/${categorySlug(c)}`}
                  className="inline-flex items-center rounded-full border px-3 py-1 text-xs hover:bg-secondary/40"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

interface CategoryProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  industry: string | null;
  upvoteCount: number;
  reviewCount: number;
  ratingValue: number;
}

async function loadCategoryProducts(category: Category): Promise<CategoryProduct[]> {
  const products = await db.product.findMany({
    where: { category, status: "LIVE", deletedAt: null },
    orderBy: [{ publishedAt: "desc" }],
    take: 100,
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      industry: true,
    },
  });
  if (products.length === 0) return [];

  const ids = products.map((p) => p.id);
  const [upvotes, reviews] = await Promise.all([
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

  return products.map((p) => {
    const r = reviewMap.get(p.id);
    return {
      ...p,
      upvoteCount: upvoteMap.get(p.id) ?? 0,
      reviewCount: r?.count ?? 0,
      ratingValue: r?.avg ?? 0,
    };
  });
}
