import { db } from "@launchmint/db";
import {
  getBacklinkSummary,
  getKeywordRankings,
} from "@launchmint/seo-data";
import { getVerifiedMrr } from "@launchmint/billing";
import { enqueue, type HandlerMap } from "@launchmint/queue";
import { track } from "@launchmint/analytics";

const SNAPSHOT_STALE_MS = 20 * 60 * 60 * 1000; // 20h - refresh daily-ish

export const seoHandlers: HandlerMap = {
  /**
   * Per-domain snapshot. Pulls the DataForSEO backlink summary and writes a
   * SeoSnapshot row scoped to the domain's linked product.
   */
  "seo-snapshot-domain": async (data) => {
    const td = await db.trackedDomain.findUnique({
      where: { id: data.trackedDomainId },
    });
    if (!td) throw new Error(`trackedDomain ${data.trackedDomainId} not found`);
    if (!td.productId) return;

    const summary = await getBacklinkSummary(td.domain);
    await db.seoSnapshot.create({
      data: {
        productId: td.productId,
        domain: td.domain,
        domainRating: summary.rank,
        backlinkCount: summary.totalBacklinks,
        refDomainCount: summary.referringDomains,
        source: "dataforseo",
      },
    });
    track(td.workspaceId, "seo_snapshot_taken", { trackedDomainId: td.id });
  },

  /**
   * Per-product keyword snapshot. Reads the distinct list of tracked keywords
   * (derived from existing KeywordRanking rows) and stamps fresh rows with the
   * latest position + search volume from DataForSEO.
   */
  "seo-snapshot-keywords": async (data) => {
    const product = await db.product.findUnique({
      where: { id: data.productId },
      select: { id: true, workspaceId: true },
    });
    if (!product) return;

    // Distinct keywords previously seeded for this product.
    const rows = await db.keywordRanking.findMany({
      where: { productId: product.id },
      distinct: ["keyword"],
      select: { keyword: true, country: true },
    });
    if (rows.length === 0) return;

    // Find the product's primary domain to query against.
    const td = await db.trackedDomain.findFirst({
      where: { workspaceId: product.workspaceId, productId: product.id },
      orderBy: [{ isPrimary: "desc" }, { addedAt: "asc" }],
      select: { domain: true },
    });
    if (!td) return;

    const byCountry = new Map<string, string[]>();
    for (const r of rows) {
      const arr = byCountry.get(r.country) ?? [];
      arr.push(r.keyword);
      byCountry.set(r.country, arr);
    }

    for (const [country, keywords] of byCountry) {
      const locationCode = countryToLocationCode(country);
      const results = await getKeywordRankings(td.domain, keywords, locationCode);
      for (const r of results) {
        await db.keywordRanking.create({
          data: {
            productId: product.id,
            keyword: r.keyword,
            position: r.position ?? null,
            searchVolume: r.searchVolume ?? null,
            url: r.url ?? null,
            country,
          },
        });
      }
    }
  },

  /**
   * Daily driver: re-snapshots any tracked domain whose latest SeoSnapshot is
   * older than ~20h, and refreshes per-product keyword rankings. Keeps the
   * dashboard fresh without paying for same-day duplicate calls.
   */
  "seo-snapshot-tick": async () => {
    const cutoff = new Date(Date.now() - SNAPSHOT_STALE_MS);
    const domains = await db.trackedDomain.findMany({
      where: { productId: { not: null } },
      select: {
        id: true,
        productId: true,
        workspaceId: true,
        domain: true,
      },
    });
    for (const d of domains) {
      const latest = await db.seoSnapshot.findFirst({
        where: { productId: d.productId!, domain: d.domain },
        orderBy: { capturedAt: "desc" },
        select: { capturedAt: true },
      });
      if (!latest || latest.capturedAt < cutoff) {
        await enqueue("seo-snapshot-domain", {
          trackedDomainId: d.id,
          workspaceId: d.workspaceId,
        }).catch(() => {});
      }
    }

    const productIds = new Set(domains.map((d) => d.productId!));
    for (const pid of productIds) {
      const product = await db.product.findUnique({
        where: { id: pid },
        select: { workspaceId: true },
      });
      if (!product) continue;
      await enqueue("seo-snapshot-keywords", {
        productId: pid,
        workspaceId: product.workspaceId,
      }).catch(() => {});
    }
  },

  /**
   * Pull verified MRR for a single product from its connected Stripe account.
   */
  "verify-mrr": async (data) => {
    const product = await db.product.findUnique({
      where: { id: data.productId },
      select: { id: true, workspaceId: true },
    });
    if (!product) return;

    const integ = await db.integration.findUnique({
      where: {
        workspaceId_type: { workspaceId: product.workspaceId, type: "STRIPE" },
      },
    });
    if (!integ?.externalId) return;

    const snap = await getVerifiedMrr(integ.externalId);
    await db.mrrSnapshot.create({
      data: {
        productId: product.id,
        mrrCents: Math.round(snap.mrrUsd * 100),
        currency: snap.currency.toUpperCase(),
        customerCount: snap.activeSubscriptions,
        source: "stripe",
      },
    });
    track(product.workspaceId, "mrr_synced", {
      productId: product.id,
      mrrCents: Math.round(snap.mrrUsd * 100),
      currency: snap.currency.toUpperCase(),
    });
  },

  /**
   * Daily tick: enqueue verify-mrr for every product whose workspace has a
   * connected Stripe account.
   */
  "verify-mrr-tick": async () => {
    const integrations = await db.integration.findMany({
      where: { type: "STRIPE", externalId: { not: null } },
      select: { workspaceId: true },
    });
    if (integrations.length === 0) return;
    const products = await db.product.findMany({
      where: {
        workspaceId: { in: integrations.map((i) => i.workspaceId) },
        deletedAt: null,
      },
      select: { id: true },
    });
    for (const p of products) {
      await enqueue("verify-mrr", { productId: p.id }).catch(() => {});
    }
  },
};

/**
 * Map LaunchMint country codes to DataForSEO `location_code`. "global" is an
 * alias for US-English SERPs which is what the client already defaults to.
 */
function countryToLocationCode(country: string): number {
  switch (country.toLowerCase()) {
    case "global":
    case "us":
      return 2840;
    case "gb":
    case "uk":
      return 2826;
    case "in":
      return 2356;
    case "de":
      return 2276;
    case "fr":
      return 2250;
    case "ca":
      return 2124;
    case "au":
      return 2036;
    default:
      return 2840;
  }
}
