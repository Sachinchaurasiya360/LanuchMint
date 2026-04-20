import type { Metadata } from "next";
import Link from "next/link";
import { Star, TrendingUp } from "lucide-react";
import { db } from "@launchmint/db";
import {
  buildMetadata,
  collectionPageJsonLd,
  breadcrumbJsonLd,
  renderJsonLd,
} from "@launchmint/seo-meta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CATEGORIES, categorySlug } from "@/lib/categories";

export const revalidate = 600;

const PAGE_SIZE = 24;

type Params = { searchParams: { page?: string; category?: string } };

export async function generateMetadata({
  searchParams,
}: Params): Promise<Metadata> {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const suffix = page > 1 ? ` - page ${page}` : "";
  return buildMetadata({
    title: `Products${suffix} - LaunchMint`,
    description:
      "Every product shipped on LaunchMint. Filter by category, sort by launch score, and discover new indie tools daily.",
    path: page > 1 ? `/products?page=${page}` : "/products",
  });
}

export default async function ProductsIndexPage({ searchParams }: Params) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const category = (searchParams.category ?? "").trim();

  const where = {
    status: "LIVE" as const,
    deletedAt: null,
    ...(category ? { category } : {}),
  };

  const [rows, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: [{ launchScore: "desc" }, { publishedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
        category: true,
        launchScore: true,
      },
    }),
    db.product.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const jsonLd = [
    collectionPageJsonLd({
      name: "Products on LaunchMint",
      description: "All LIVE products shipped on LaunchMint.",
      url: "/products",
      items: rows.map((p) => ({
        name: p.name,
        url: `/products/${p.slug}`,
      })),
    }),
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
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
        <Breadcrumbs items={[{ name: "Products", url: "/products" }]} />
        <header className="mt-4">
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every product shipped on LaunchMint, ranked by launch score. Filter
            by category, or browse the{" "}
            <Link href="/today" className="underline">
              live leaderboard
            </Link>
            .
          </p>
        </header>

        <nav
          aria-label="Filter by category"
          className="mt-6 flex flex-wrap gap-2"
        >
          <Link
            href="/products"
            className={`rounded-full border px-3 py-1 text-xs ${!category ? "bg-foreground text-background" : "hover:bg-muted"}`}
          >
            All
          </Link>
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <Link
                key={c}
                href={`/products?category=${encodeURIComponent(c)}`}
                className={`rounded-full border px-3 py-1 text-xs ${active ? "bg-foreground text-background" : "hover:bg-muted"}`}
              >
                {c}
              </Link>
            );
          })}
        </nav>

        {rows.length === 0 ? (
          <p className="mt-12 text-sm text-muted-foreground">
            No products{category ? ` in ${category}` : ""} yet.
          </p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border p-4 transition hover:border-foreground/20 hover:bg-muted/30"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Link
                    href={`/categories/${categorySlug(p.category)}`}
                    className="rounded-full border bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide hover:bg-muted"
                  >
                    {p.category}
                  </Link>
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {p.launchScore}
                  </span>
                </div>
                <h2 className="mt-3 text-base font-semibold">
                  <Link
                    href={`/products/${p.slug}`}
                    className="hover:underline"
                  >
                    {p.name}
                  </Link>
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {p.tagline}
                </p>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 ? (
          <nav
            aria-label="Pagination"
            className="mt-10 flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">
              Page {page} of {totalPages} · {total} products
            </span>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={`/products?page=${page - 1}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
                  rel="prev"
                  className="rounded-md border px-3 py-1 hover:bg-muted"
                >
                  ← Previous
                </Link>
              ) : null}
              {page < totalPages ? (
                <Link
                  href={`/products?page=${page + 1}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
                  rel="next"
                  className="rounded-md border px-3 py-1 hover:bg-muted"
                >
                  Next <Star className="hidden" />→
                </Link>
              ) : null}
            </div>
          </nav>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
