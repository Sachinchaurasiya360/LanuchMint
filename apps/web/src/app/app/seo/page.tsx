import { BarChart3, Globe, Link2, TrendingUp } from "lucide-react";
import { db } from "@launchmint/db";
import { Badge, Button, EmptyState, Kpi } from "@launchmint/ui";
import { requireSession } from "@/lib/session";
import { AddDomainForm, RemoveDomainButton } from "./add-domain-form";
import { KeywordControls } from "./keyword-controls";
import { SeoSuggestionsPanel } from "./suggestions-panel";
import { Sparkline } from "./sparkline";

export const dynamic = "force-dynamic";

export default async function SeoPage() {
  const { workspaceId } = await requireSession();

  const [products, domains] = await Promise.all([
    db.product.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, slug: true, seoKeywords: true },
    }),
    db.trackedDomain.findMany({
      where: { workspaceId },
      orderBy: { addedAt: "asc" },
    }),
  ]);

  // Pull last 14 snapshots per product for sparklines + headline KPIs.
  const snapshots = await db.seoSnapshot.findMany({
    where: { productId: { in: products.map((p) => p.id) } },
    orderBy: { capturedAt: "desc" },
    take: 14 * Math.max(1, products.length),
  });

  const byProduct = new Map<
    string,
    Awaited<ReturnType<typeof db.seoSnapshot.findMany>>
  >();
  for (const snap of snapshots) {
    const arr = byProduct.get(snap.productId) ?? [];
    if (arr.length < 14) arr.push(snap);
    byProduct.set(snap.productId, arr);
  }

  const keywordsByProduct = new Map<
    string,
    { keyword: string; position: number | null; searchVolume: number | null; url: string | null }[]
  >();
  if (products.length > 0) {
    const rows = await db.keywordRanking.findMany({
      where: { productId: { in: products.map((p) => p.id) } },
      orderBy: { capturedAt: "desc" },
    });
    for (const row of rows) {
      const arr = keywordsByProduct.get(row.productId) ?? [];
      if (!arr.some((r) => r.keyword === row.keyword)) {
        arr.push({
          keyword: row.keyword,
          position: row.position,
          searchVolume: row.searchVolume,
          url: row.url,
        });
      }
      keywordsByProduct.set(row.productId, arr);
    }
  }

  const backlinkByProduct = new Map<string, number>();
  if (products.length > 0) {
    const grouped = await db.backlink.groupBy({
      by: ["productId"],
      where: { productId: { in: products.map((p) => p.id) }, isLive: true },
      _count: { _all: true },
    });
    for (const g of grouped) backlinkByProduct.set(g.productId, g._count._all);
  }

  const totalBacklinks = Array.from(backlinkByProduct.values()).reduce(
    (s, n) => s + n,
    0,
  );
  const latestSnapByProduct = new Map<string, (typeof snapshots)[number]>();
  for (const s of snapshots) {
    if (!latestSnapByProduct.has(s.productId)) latestSnapByProduct.set(s.productId, s);
  }
  const avgDr = (() => {
    const vals = Array.from(latestSnapByProduct.values())
      .map((s) => s.domainRating ?? null)
      .filter((v): v is number => typeof v === "number");
    if (vals.length === 0) return null;
    return Math.round(vals.reduce((s, n) => s + n, 0) / vals.length);
  })();
  const totalOrganic = Array.from(latestSnapByProduct.values()).reduce(
    (s, snap) => s + (snap.organicTraffic ?? 0),
    0,
  );
  const totalKeywordsTracked = Array.from(keywordsByProduct.values()).reduce(
    (s, arr) => s + arr.length,
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">SEO</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Domain rating, organic traffic, tracked keywords, and backlinks -
            refreshed daily from DataForSEO.
          </p>
        </div>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-4">
        <Kpi
          label="Avg DR"
          value={avgDr ?? "-"}
          hint={`${latestSnapByProduct.size} tracked`}
        />
        <Kpi
          label="Organic / mo"
          value={totalOrganic.toLocaleString()}
          hint="est."
        />
        <Kpi label="Keywords tracked" value={totalKeywordsTracked} />
        <Kpi label="Live backlinks" value={totalBacklinks} />
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-muted-foreground">Add a domain</h2>
        <div className="mt-3 rounded-lg border p-4">
          <AddDomainForm
            products={products.map((p) => ({ id: p.id, name: p.name }))}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-muted-foreground">
          Tracked domains
        </h2>
        {domains.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={Globe}
              title="No domains yet"
              description="Add your product's domain above to start pulling SEO snapshots."
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y rounded-lg border">
            {domains.map((d) => {
              const snaps = (byProduct.get(d.productId ?? "") ?? [])
                .slice()
                .reverse();
              const latest = snaps[snaps.length - 1];
              return (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center gap-4 p-4"
                >
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm font-medium">
                      {d.domain}{" "}
                      {d.isPrimary ? (
                        <Badge variant="secondary">primary</Badge>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Added {d.addedAt.toISOString().slice(0, 10)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> DR
                      <span className="font-medium text-foreground">
                        {latest?.domainRating ?? "-"}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" /> Organic
                      <span className="font-medium text-foreground">
                        {(latest?.organicTraffic ?? 0).toLocaleString()}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Link2 className="h-3 w-3" /> Backlinks
                      <span className="font-medium text-foreground">
                        {latest?.backlinkCount ?? 0}
                      </span>
                    </span>
                    <Sparkline
                      values={snaps.map((s) => s.domainRating ?? null)}
                    />
                  </div>
                  <RemoveDomainButton id={d.id} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-sm font-medium text-muted-foreground">
          Per-product keywords
        </h2>
        {products.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No products"
            description="Create a product to start tracking SEO per product."
          />
        ) : (
          products.map((p) => {
            const keywords = keywordsByProduct.get(p.id) ?? [];
            const top = keywords
              .filter((k) => k.position !== null)
              .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
              .slice(0, 10);
            return (
              <div key={p.id} className="rounded-lg border p-4">
                <KeywordControls
                  productId={p.id}
                  productName={p.name}
                  keywords={keywords.map((k) => k.keyword)}
                />
                {top.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Top positions
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {top.map((k) => (
                        <li
                          key={k.keyword}
                          className="flex items-center justify-between gap-4"
                        >
                          <span>{k.keyword}</span>
                          <span className="inline-flex items-center gap-3 text-xs text-muted-foreground">
                            {k.searchVolume ? (
                              <span>{k.searchVolume.toLocaleString()} vol</span>
                            ) : null}
                            <Badge variant="secondary">#{k.position}</Badge>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <SeoSuggestionsPanel productId={p.id} />
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
