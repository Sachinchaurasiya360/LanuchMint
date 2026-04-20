"use server";

import { revalidatePath } from "next/cache";
import { db } from "@launchmint/db";
import { verifyReviewInvite } from "@launchmint/auth/tokens";
import { enqueue } from "@launchmint/queue";
import { track } from "@launchmint/analytics";

export interface SubmitReviewInput {
  token: string;
  rating: number;
  title?: string;
  body: string;
}

export interface SubmitReviewResult {
  ok: true;
  productSlug: string;
}

export async function submitReviewAction(
  input: SubmitReviewInput,
): Promise<SubmitReviewResult> {
  const verified = verifyReviewInvite(input.token);
  if (!verified.ok) {
    throw new Error(`INVALID_TOKEN:${verified.reason}`);
  }
  const { productId, email } = verified.payload;

  const rating = Math.round(input.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be 1-5.");
  }
  const body = input.body.trim();
  if (body.length < 30) {
    throw new Error("Review must be at least 30 characters.");
  }
  if (body.length > 5_000) {
    throw new Error("Review must be under 5000 characters.");
  }
  const title = input.title?.trim().slice(0, 120) || null;

  const product = await db.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: { id: true, slug: true, workspaceId: true },
  });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  const existing = await db.review.findFirst({
    where: { productId, authorEmail: email },
    select: { id: true },
  });
  if (existing) throw new Error("ALREADY_REVIEWED");

  const userByEmail = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  const review = await db.review.create({
    data: {
      productId,
      authorId: userByEmail?.id ?? null,
      authorEmail: email,
      rating,
      title,
      body,
      isVerified: true,
      verificationMethod: "email-invite",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await enqueue("ai-classify-review", {
    reviewId: review.id,
    workspaceId: product.workspaceId,
  }).catch(() => {});

  track(userByEmail?.id ?? email, "review_submitted", {
    productId,
    rating,
    verified: true,
  });

  revalidatePath(`/products/${product.slug}`);
  return { ok: true, productSlug: product.slug };
}
