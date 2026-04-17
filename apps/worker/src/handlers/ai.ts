import { db } from "@launchmint/db";
import {
  classifyFakeReview,
  generateLaunchReadiness,
  generateMetaDescription,
  generateMetaTitle,
  generateProductDescription,
} from "@launchmint/ai";
import type { HandlerMap } from "@launchmint/queue";

const FAKE_QUARANTINE_THRESHOLD = 0.7;

export const aiHandlers: HandlerMap = {
  "ai-classify-review": async (data) => {
    const review = await db.review.findUnique({
      where: { id: data.reviewId },
      include: {
        product: { select: { name: true, category: true } },
      },
    });
    if (!review) return;

    const priorReviewCount = review.authorId
      ? await db.review.count({
          where: { authorId: review.authorId, NOT: { id: review.id } },
        })
      : 0;

    const result = await classifyFakeReview({
      workspaceId: data.workspaceId,
      reviewId: review.id,
      productName: review.product.name,
      productCategory: review.product.category,
      rating: review.rating,
      title: review.title ?? undefined,
      body: review.body,
      isVerifiedEmail: review.isVerified,
      authorPriorReviewCount: priorReviewCount,
    });

    const shouldQuarantine = result.fakeScore >= FAKE_QUARANTINE_THRESHOLD;
    await db.review.update({
      where: { id: review.id },
      data: {
        fakeScore: result.fakeScore,
        isFlagged: shouldQuarantine,
        status: shouldQuarantine ? "FLAGGED" : review.status,
      },
    });
  },
  "ai-launch-readiness": async (data) => {
    const product = await db.product.findUnique({
      where: { id: data.productId },
      include: { screenshots: { select: { id: true } } },
    });
    if (!product) throw new Error(`product ${data.productId} not found`);

    const result = await generateLaunchReadiness({
      workspaceId: data.workspaceId,
      productId: product.id,
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      category: product.category,
      websiteUrl: product.websiteUrl,
      hasLogo: Boolean(product.logoUrl),
      hasOgImage: Boolean(product.ogImageUrl),
      screenshotCount: product.screenshots.length,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      seoKeywordCount: product.seoKeywords.length,
    });

    const existingMeta = (product.metadata as Record<string, unknown> | null) ?? {};
    await db.product.update({
      where: { id: product.id },
      data: {
        launchScore: result.score,
        metadata: {
          ...existingMeta,
          launchReadiness: {
            score: result.score,
            summary: result.summary,
            blockers: result.blockers,
            suggestions: result.suggestions,
            scoredAt: new Date().toISOString(),
          },
        },
      },
    });
  },
  "ai-generate-product-meta": async (data) => {
    const product = await db.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error(`product ${data.productId} not found`);

    const updates: Record<string, string> = {};

    if (data.fields.includes("description")) {
      const r = await generateProductDescription({
        workspaceId: data.workspaceId,
        name: product.name,
        tagline: product.tagline,
        category: product.category ?? "SaaS",
        features: [],
        audience: "indie founders",
      });
      updates.description = r.text.trim();
    }

    if (data.fields.includes("metaTitle")) {
      const r = await generateMetaTitle({
        workspaceId: data.workspaceId,
        productName: product.name,
        tagline: product.tagline,
        category: product.category ?? "SaaS",
      });
      updates.metaTitle = r.text.trim();
    }

    if (data.fields.includes("metaDescription")) {
      const r = await generateMetaDescription({
        workspaceId: data.workspaceId,
        productName: product.name,
        tagline: product.tagline,
        category: product.category ?? "SaaS",
        primaryBenefit: product.tagline,
      });
      updates.metaDescription = r.text.trim();
    }

    if (Object.keys(updates).length > 0) {
      await db.product.update({ where: { id: product.id }, data: updates });
    }
  },
};
