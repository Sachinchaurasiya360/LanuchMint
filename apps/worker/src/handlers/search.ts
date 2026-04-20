import { db } from "@launchmint/db";
import { ensureCollections, upsertDoc, deleteDoc } from "@launchmint/search";
import { enqueue, type HandlerMap } from "@launchmint/queue";

export const searchHandlers: HandlerMap = {
  "index-product": async (data) => {
    await ensureCollections();
    const product = await db.product.findUnique({
      where: { id: data.productId },
      include: { _count: { select: { upvotes: true } } },
    });
    if (!product) return;

    if (product.deletedAt || product.status !== "LIVE") {
      await deleteDoc("products", product.id).catch(() => {});
      return;
    }

    const ratingAgg = await db.review.aggregate({
      where: {
        productId: product.id,
        status: "PUBLISHED",
        deletedAt: null,
      },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await upsertDoc("products", {
      id: product.id,
      slug: product.slug,
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      category: product.category,
      tags: product.seoKeywords,
      upvoteCount: product._count.upvotes,
      reviewCount: ratingAgg._count._all,
      averageRating: ratingAgg._avg.rating ?? 0,
      publishedAt: product.publishedAt
        ? Math.floor(product.publishedAt.getTime() / 1000)
        : 0,
      logoUrl: product.logoUrl ?? "",
    });
  },

  "index-founder": async (data) => {
    await ensureCollections();
    const profile = await db.founderProfile.findUnique({
      where: { userId: data.userId },
    });
    if (!profile) return;
    if (profile.deletedAt || !profile.publishedAt) {
      await deleteDoc("founders", profile.id).catch(() => {});
      return;
    }

    // Latest verified MRR across any of this founder's products - pulls the
    // biggest number so the leaderboard ranks by their best-performing product.
    const latest = await db.mrrSnapshot.findFirst({
      where: {
        product: { workspaceId: profile.workspaceId },
      },
      orderBy: { capturedAt: "desc" },
    });

    await upsertDoc("founders", {
      id: profile.id,
      slug: profile.slug,
      displayName: profile.displayName,
      headline: profile.headline ?? "",
      bio: profile.bio ?? "",
      skills: [],
      verifiedMrrUsd: latest ? latest.mrrCents / 100 : 0,
      country: profile.location ?? "",
      avatarUrl: "",
    });
  },

  /**
   * Bulk reindex. Kept cheap - iterates in pages of 200 per collection
   * and fans out into `index-*` jobs so retries are per-doc.
   */
  "reindex-search": async (data) => {
    await ensureCollections();
    if (data.kind === "products") {
      const products = await db.product.findMany({
        where: { deletedAt: null, status: "LIVE" },
        select: { id: true },
        take: 500,
      });
      for (const p of products) {
        await enqueue("index-product", { productId: p.id }).catch(() => {});
      }
    } else if (data.kind === "founders") {
      const rows = await db.founderProfile.findMany({
        where: { deletedAt: null, publishedAt: { not: null } },
        select: { userId: true },
        take: 500,
      });
      for (const r of rows) {
        await enqueue("index-founder", { userId: r.userId }).catch(() => {});
      }
    } else if (data.kind === "directories") {
      const rows = await db.directory.findMany({
        where: { status: "ACTIVE" },
        take: 500,
      });
      for (const d of rows) {
        await upsertDoc("directories", {
          id: d.id,
          slug: d.slug,
          name: d.name,
          description: d.description ?? "",
          domainAuthority: d.domainRating ?? 0,
          submissionCost: d.cost,
          category: d.category[0] ?? "",
        }).catch(() => {});
      }
    }
  },
};
