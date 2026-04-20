import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@launchmint/db";
import {
  breadcrumbJsonLd,
  buildMetadata,
  collectionPageJsonLd,
  renderJsonLd,
} from "@launchmint/seo-meta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CATEGORIES, categorySlug } from "@/lib/categories";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Browse products by category",
  description:
    "Explore startups on LaunchMint grouped by category - from AI and Developer Tools to Marketing and Design.",
  path: "/categories",
});

export default async function CategoriesIndex() {
  const grouped = await db.product.groupBy({
    by: ["category"],
    where: { status: "LIVE", deletedAt: null },
    _count: { _all: true },
  });
  const counts = new Map<string, number>(
    grouped.map((g) => [g.category, g._count._all]),
  );

  const cards = CATEGORIES.map((c) => ({
    name: c,
    slug: categorySlug(c),
    count: counts.get(c) ?? 0,
  }));

  const jsonLd = [
    collectionPageJsonLd({
      name: "Categories",
      description: "All product categories on LaunchMint.",
      url: "/categories",
      items: cards.map((c) => ({
        name: c.name,
        url: `/categories/${c.slug}`,
      })),
    }),
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Categories", url: "/categories" },
    ]),
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
          <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse LaunchMint by what products do.
          </p>
        </header>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/categories/${c.slug}`}
                className="block rounded-lg border p-4 transition hover:border-foreground/20 hover:bg-secondary/30"
              >
                <p className="text-base font-semibold">{c.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.count} {c.count === 1 ? "product" : "products"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
