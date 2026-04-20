import Link from "next/link";
import { Search } from "lucide-react";
import { buildMetadata } from "@launchmint/seo-meta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Search - LaunchMint",
  description:
    "Search across products, founders, and directories on LaunchMint.",
  path: "/search",
  noindex: true,
});

interface Hit {
  kind: "products" | "founders" | "directories";
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  href: string;
}

async function runSearch(q: string, origin: string): Promise<Hit[]> {
  if (!q) return [];
  try {
    const res = await fetch(
      `${origin}/api/v1/search?q=${encodeURIComponent(q)}&limit=15`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { hits: Hit[] };
    return data.hits ?? [];
  } catch {
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const hits = await runSearch(q, origin);

  const grouped = {
    products: hits.filter((h) => h.kind === "products"),
    founders: hits.filter((h) => h.kind === "founders"),
    directories: hits.filter((h) => h.kind === "directories"),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
        <form
          action="/search"
          method="get"
          className="mt-6 flex items-center gap-2 rounded-md border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring"
        >
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            autoFocus
            placeholder="Search products, founders, directories…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search query"
          />
        </form>

        {q ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {hits.length} {hits.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Type a query above. Results come from live Typesense indexes.
          </p>
        )}

        {q && hits.length === 0 ? (
          <div className="mt-12 text-center text-sm text-muted-foreground">
            No matches. Try a broader term or a category name.
          </div>
        ) : null}

        {(
          [
            ["products", "Products"],
            ["founders", "Founders"],
            ["directories", "Directories"],
          ] as const
        ).map(([kind, label]) =>
          grouped[kind].length ? (
            <section key={kind} className="mt-10">
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </h2>
              <ul className="mt-3 divide-y rounded-md border">
                {grouped[kind].map((h) => (
                  <li key={h.id}>
                    <Link
                      href={h.href}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {h.title}
                        </div>
                        {h.subtitle ? (
                          <div className="truncate text-xs text-muted-foreground">
                            {h.subtitle}
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null,
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
