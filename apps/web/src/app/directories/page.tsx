import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Gauge } from "lucide-react";
import { db } from "@launchmint/db";
import { Badge, Input } from "@launchmint/ui";
import {
  breadcrumbJsonLd,
  buildMetadata,
  collectionPageJsonLd,
  renderJsonLd,
} from "@launchmint/seo-meta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Startup directories — curated submission targets",
  description:
    "Submit your startup to the directories that actually drive traffic and backlinks. Filter by niche, domain rating, and cost.",
  path: "/directories",
});

type SearchParams = {
  q?: string;
  category?: string;
  cost?: string;
};

export default async function DirectoriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = (searchParams.q ?? "").trim().slice(0, 80);
  const category = (searchParams.category ?? "").trim().slice(0, 40);
  const cost = (searchParams.cost ?? "").trim();

  const directories = await db.directory.findMany({
    where: {
      status: "ACTIVE",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
              { niche: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(category ? { category: { has: category } } : {}),
      ...(cost ? { cost } : {}),
    },
    orderBy: [{ domainRating: "desc" }, { name: "asc" }],
    take: 200,
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      niche: true,
      domainRating: true,
      cost: true,
      hasApi: true,
    },
  });

  const allCategories = await db.directory.findMany({
    where: { status: "ACTIVE" },
    select: { category: true },
    take: 500,
  });
  const categorySet = new Set<string>();
  for (const d of allCategories) {
    for (const c of d.category) categorySet.add(c);
  }
  const categoryOptions = Array.from(categorySet).sort();

  const jsonLd = [
    collectionPageJsonLd({
      name: "Startup directories",
      description:
        "Curated submission targets for startups — niche directories, launch platforms, and backlink-worthy listing sites.",
      url: "/directories",
      items: directories.map((d) => ({
        name: d.name,
        url: `/directories/${d.slug}`,
      })),
    }),
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Directories", url: "/directories" },
    ]),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLd(jsonLd) }}
        />
        <header>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Directory database
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Directories that actually drive traffic
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every entry is hand-curated — cost, domain rating, and review speed
            verified by the LaunchMint team. Connect a product to auto-generate
            tailored submission copy.
          </p>
        </header>

        <form className="mt-8 flex flex-wrap items-end gap-3" action="/directories">
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs text-muted-foreground" htmlFor="dir-q">
              Search
            </label>
            <Input
              id="dir-q"
              name="q"
              defaultValue={q}
              placeholder="e.g. AI tools, designers, YC"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="dir-category">
              Category
            </label>
            <select
              id="dir-category"
              name="category"
              defaultValue={category}
              className="mt-1 block h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">All categories</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="dir-cost">
              Cost
            </label>
            <select
              id="dir-cost"
              name="cost"
              defaultValue={cost}
              className="mt-1 block h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Any</option>
              <option value="FREE">Free</option>
              <option value="FREEMIUM">Freemium</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <button
            type="submit"
            className="h-10 rounded-md bg-amber-400 px-4 text-sm font-medium text-black hover:bg-amber-300"
          >
            Filter
          </button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          {directories.length} director{directories.length === 1 ? "y" : "ies"} found
        </p>

        <ul className="mt-4 divide-y rounded-lg border">
          {directories.map((d) => (
            <li key={d.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/directories/${d.slug}`}
                      className="text-base font-semibold hover:underline"
                    >
                      {d.name}
                    </Link>
                    <Badge variant="secondary">{d.cost}</Badge>
                    {d.hasApi ? (
                      <Badge variant="secondary">API</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {d.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {d.category.slice(0, 4).map((c) => (
                      <Badge key={c} variant="outline" className="text-xs">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-sm">
                  {typeof d.domainRating === "number" ? (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Gauge className="h-3.5 w-3.5" />
                      DR {d.domainRating}
                    </span>
                  ) : null}
                  <Link
                    href={`/directories/${d.slug}`}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Details <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
          {directories.length === 0 ? (
            <li className="p-6 text-sm text-muted-foreground">
              No directories match those filters. Try clearing one.
            </li>
          ) : null}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
