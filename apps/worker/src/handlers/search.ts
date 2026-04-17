import { db } from "@launchmint/db";
import { ensureCollections, upsertDoc } from "@launchmint/search";
import type { HandlerMap } from "@launchmint/queue";

export const searchHandlers: HandlerMap = {
  "index-product": async (data) => {
    await ensureCollections();
    const product = await db.product.findUnique({
      where: { id: data.productId },
      include: { _count: { select: { upvotes: true } } },
    });
    if (!product) return;

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
  "reindex-search": async () => {
    await ensureCollections();
  },
};
