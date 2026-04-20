"use server";

import { revalidatePath } from "next/cache";
import { db } from "@launchmint/db";
import { requirePermission } from "@launchmint/auth";
import { can } from "@launchmint/billing";
import { enqueue } from "@launchmint/queue";
import { generateSeoSuggestions, generateKeywordSuggestions } from "@launchmint/ai";
import { requireSession } from "@/lib/session";

function normalizeDomain(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  const withProto = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withProto);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export async function addTrackedDomainAction(input: {
  domain: string;
  productId: string;
}) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "product.update");

  const domain = normalizeDomain(input.domain);
  if (!domain) throw new Error("INVALID_DOMAIN");

  const product = await db.product.findFirst({
    where: { id: input.productId, workspaceId },
    select: { id: true },
  });
  if (!product) throw new Error("NOT_FOUND");

  const [sub, count] = await Promise.all([
    db.subscription.findUnique({ where: { workspaceId } }),
    db.trackedDomain.count({ where: { workspaceId } }),
  ]);
  const plan = sub?.plan ?? "FREE";
  const decision = can(
    { kind: "add", resource: "trackedDomains" },
    { plan, currentCounts: { trackedDomains: count } },
  );
  if (!decision.ok) throw new Error(decision.reason ?? "GATED");

  const td = await db.trackedDomain.upsert({
    where: { workspaceId_domain: { workspaceId, domain } },
    create: { workspaceId, domain, productId: product.id, isPrimary: count === 0 },
    update: { productId: product.id },
  });

  await enqueue("seo-snapshot-domain", {
    trackedDomainId: td.id,
    workspaceId,
  }).catch(() => {});

  revalidatePath("/app/seo");
  return { id: td.id, domain: td.domain };
}

export async function removeTrackedDomainAction(id: string) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "product.update");

  const td = await db.trackedDomain.findFirst({
    where: { id, workspaceId },
    select: { id: true },
  });
  if (!td) throw new Error("NOT_FOUND");

  await db.trackedDomain.delete({ where: { id } });
  revalidatePath("/app/seo");
}

export async function addTrackedKeywordAction(input: {
  productId: string;
  keyword: string;
  country?: string;
}) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "product.update");

  const keyword = input.keyword.trim().toLowerCase();
  if (!keyword || keyword.length > 120) throw new Error("INVALID_KEYWORD");

  const product = await db.product.findFirst({
    where: { id: input.productId, workspaceId },
    select: { id: true },
  });
  if (!product) throw new Error("NOT_FOUND");

  // One seed row per keyword; the worker will stamp subsequent snapshots.
  await db.keywordRanking.create({
    data: {
      productId: product.id,
      keyword,
      country: input.country ?? "global",
    },
  });

  await enqueue("seo-snapshot-keywords", {
    productId: product.id,
    workspaceId,
  }).catch(() => {});

  revalidatePath("/app/seo");
}

export async function removeTrackedKeywordAction(input: {
  productId: string;
  keyword: string;
}) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "product.update");

  const product = await db.product.findFirst({
    where: { id: input.productId, workspaceId },
    select: { id: true },
  });
  if (!product) throw new Error("NOT_FOUND");

  await db.keywordRanking.deleteMany({
    where: { productId: product.id, keyword: input.keyword.toLowerCase() },
  });
  revalidatePath("/app/seo");
}

export async function refreshSeoSnapshotAction(productId: string) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "product.update");

  const [sub, usage] = await Promise.all([
    db.subscription.findUnique({ where: { workspaceId } }),
    db.usageCounter.findUnique({ where: { workspaceId } }),
  ]);
  const plan = sub?.plan ?? "FREE";
  const decision = can(
    { kind: "consume", usage: "seoChecksUsed" },
    { plan, usage: { seoChecksUsed: usage?.seoChecksUsed ?? 0 } },
  );
  if (!decision.ok) throw new Error(decision.reason ?? "GATED");

  const product = await db.product.findFirst({
    where: { id: productId, workspaceId },
    select: { id: true },
  });
  if (!product) throw new Error("NOT_FOUND");

  const domains = await db.trackedDomain.findMany({
    where: { workspaceId, productId: product.id },
    select: { id: true },
  });
  for (const d of domains) {
    await enqueue("seo-snapshot-domain", {
      trackedDomainId: d.id,
      workspaceId,
    }).catch(() => {});
  }
  await enqueue("seo-snapshot-keywords", {
    productId: product.id,
    workspaceId,
  }).catch(() => {});

  // Best-effort usage increment - the snapshot tick itself is idempotent
  // so mild over-counting is fine; under-counting would let quota leak.
  await db.usageCounter
    .update({
      where: { workspaceId },
      data: { seoChecksUsed: { increment: 1 } },
    })
    .catch(() => {});

  revalidatePath("/app/seo");
}

export async function generateSeoSuggestionsAction(productId: string) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "product.update");

  const product = await db.product.findFirst({
    where: { id: productId, workspaceId },
  });
  if (!product) throw new Error("NOT_FOUND");

  const [latestSnap, topKeywords, backlinkCount] = await Promise.all([
    db.seoSnapshot.findFirst({
      where: { productId: product.id },
      orderBy: { capturedAt: "desc" },
    }),
    db.keywordRanking.findMany({
      where: { productId: product.id, position: { not: null } },
      orderBy: { position: "asc" },
      take: 10,
    }),
    db.backlink.count({ where: { productId: product.id, isLive: true } }),
  ]);

  const res = await generateSeoSuggestions({
    workspaceId,
    productName: product.name,
    productTagline: product.tagline,
    productDescription: product.description,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    domainRating: latestSnap?.domainRating ?? null,
    organicTraffic: latestSnap?.organicTraffic ?? null,
    backlinkCount,
    topKeywords: topKeywords.map((k) => ({
      keyword: k.keyword,
      position: k.position ?? 0,
    })),
  });
  return res.suggestions;
}

export async function suggestKeywordsAction(productId: string) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "product.update");

  const product = await db.product.findFirst({
    where: { id: productId, workspaceId },
  });
  if (!product) throw new Error("NOT_FOUND");

  const res = await generateKeywordSuggestions({
    workspaceId,
    productName: product.name,
    productTagline: product.tagline,
    productDescription: product.description,
    productCategory: product.category,
    seedKeywords: product.seoKeywords,
  });
  return res.suggestions;
}
