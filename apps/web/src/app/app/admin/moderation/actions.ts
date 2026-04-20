"use server";

import { revalidatePath } from "next/cache";
import { db } from "@launchmint/db";
import { requirePermission } from "@launchmint/auth";
import { requireSession } from "@/lib/session";
import { recordAudit } from "@/lib/audit";

type ReviewDecision = "approve" | "remove";

export async function decideReviewAction(
  reviewId: string,
  decision: ReviewDecision,
) {
  const { ctx, userId } = await requireSession();
  const action = decision === "approve" ? "review.reply" : "review.delete";
  // `review.reply` gates approval (bring out of flagged); removal is admin.
  if (decision === "approve") {
    requirePermission(ctx, "moderation.decide");
  } else {
    requirePermission(ctx, "review.delete");
  }

  const review = await db.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new Error("review not found");

  if (decision === "approve") {
    await db.review.update({
      where: { id: reviewId },
      data: {
        status: "PUBLISHED",
        isFlagged: false,
        publishedAt: review.publishedAt ?? new Date(),
      },
    });
  } else {
    await db.review.update({
      where: { id: reviewId },
      data: { status: "REMOVED", deletedAt: new Date() },
    });
  }

  await recordAudit({
    actorId: userId,
    workspaceId: null,
    action: `moderation.review.${decision}`,
    target: `review:${reviewId}`,
    metadata: { productId: review.productId },
  });

  revalidatePath("/app/admin/moderation");
  void action;
}

export async function decideCommentAction(
  commentId: string,
  decision: ReviewDecision,
) {
  const { ctx, userId } = await requireSession();
  if (decision === "approve") {
    requirePermission(ctx, "moderation.decide");
  } else {
    requirePermission(ctx, "comment.delete");
  }

  const comment = await db.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error("comment not found");

  if (decision === "approve") {
    await db.comment.update({
      where: { id: commentId },
      data: { status: "PUBLISHED" },
    });
  } else {
    await db.comment.update({
      where: { id: commentId },
      data: { status: "REMOVED", deletedAt: new Date() },
    });
  }

  await recordAudit({
    actorId: userId,
    action: `moderation.comment.${decision}`,
    target: `comment:${commentId}`,
    metadata: { productId: comment.productId },
  });

  revalidatePath("/app/admin/moderation");
}

export async function decideProductAction(
  productId: string,
  decision: ReviewDecision,
) {
  const { ctx, userId } = await requireSession();
  if (decision === "approve") {
    requirePermission(ctx, "moderation.decide");
  } else {
    requirePermission(ctx, "product.delete");
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("product not found");

  if (decision === "approve") {
    await db.product.update({
      where: { id: productId },
      data: { status: "LIVE" },
    });
  } else {
    await db.product.update({
      where: { id: productId },
      data: { status: "ARCHIVED", deletedAt: new Date() },
    });
  }

  await recordAudit({
    actorId: userId,
    action: `moderation.product.${decision}`,
    target: `product:${productId}`,
    metadata: { workspaceId: product.workspaceId },
  });

  revalidatePath("/app/admin/moderation");
}
