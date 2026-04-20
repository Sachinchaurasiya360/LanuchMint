"use server";

import { revalidatePath } from "next/cache";
import { db } from "@launchmint/db";
import { generateReviewReply } from "@launchmint/ai";
import { requirePermission } from "@launchmint/auth";
import { signReviewInvite } from "@launchmint/auth/tokens";
import { enqueue } from "@launchmint/queue";
import { requireSession } from "@/lib/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface InviteReviewersInput {
  productId: string;
  emails: string[];
  personalNote?: string;
}

export interface InviteReviewersResult {
  invited: number;
  skippedDuplicates: number;
  skippedInvalid: number;
}

export async function inviteReviewersAction(
  input: InviteReviewersInput,
): Promise<InviteReviewersResult> {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "review.reply");

  const product = await db.product.findFirst({
    where: { id: input.productId, workspaceId, deletedAt: null },
    select: { id: true },
  });
  if (!product) throw new Error("NOT_FOUND");

  const cleaned = Array.from(
    new Set(
      input.emails
        .map((e) => e.toLowerCase().trim())
        .filter((e) => e.length > 0),
    ),
  );

  let invited = 0;
  let skippedInvalid = 0;
  let skippedDuplicates = 0;

  const existing = await db.review.findMany({
    where: {
      productId: product.id,
      authorEmail: { in: cleaned },
    },
    select: { authorEmail: true },
  });
  const taken = new Set(existing.map((r) => r.authorEmail));

  for (const email of cleaned) {
    if (!EMAIL_RE.test(email)) {
      skippedInvalid += 1;
      continue;
    }
    if (taken.has(email)) {
      skippedDuplicates += 1;
      continue;
    }
    const token = signReviewInvite(product.id, email);
    await enqueue("send-review-invite", {
      productId: product.id,
      workspaceId,
      email,
      token,
      personalNote: input.personalNote,
    });
    invited += 1;
  }

  revalidatePath(`/app/products/${product.id}/reviews`);
  return { invited, skippedDuplicates, skippedInvalid };
}

export interface ReplyToReviewInput {
  reviewId: string;
  body: string;
}

export async function replyToReviewAction(input: ReplyToReviewInput) {
  const { ctx, userId, workspaceId } = await requireSession();
  requirePermission(ctx, "review.reply");

  const review = await db.review.findFirst({
    where: { id: input.reviewId, product: { workspaceId } },
    include: { product: { select: { id: true, slug: true } } },
  });
  if (!review) throw new Error("NOT_FOUND");

  const body = input.body.trim();
  if (body.length === 0) throw new Error("Reply cannot be empty.");
  if (body.length > 4_000) throw new Error("Reply too long (max 4000 chars).");

  await db.reviewReply.upsert({
    where: { reviewId: review.id },
    update: { body },
    create: { reviewId: review.id, authorId: userId, body },
  });

  revalidatePath(`/app/products/${review.product.id}/reviews`);
  revalidatePath(`/products/${review.product.slug}`);
}

export async function suggestReplyAction(reviewId: string): Promise<string> {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "review.reply");

  const review = await db.review.findFirst({
    where: { id: reviewId, product: { workspaceId } },
    include: {
      product: {
        select: {
          name: true,
          workspace: {
            select: {
              founderProfile: { select: { displayName: true } },
            },
          },
        },
      },
    },
  });
  if (!review) throw new Error("NOT_FOUND");

  const founderName =
    review.product.workspace.founderProfile?.displayName ?? "the team";

  const r = await generateReviewReply({
    workspaceId,
    productName: review.product.name,
    founderName,
    reviewRating: review.rating,
    reviewTitle: review.title ?? undefined,
    reviewBody: review.body,
  });
  return r.text.trim();
}

export async function moderateReviewAction(
  reviewId: string,
  action: "publish" | "remove",
) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "review.reply");

  const review = await db.review.findFirst({
    where: { id: reviewId, product: { workspaceId } },
    select: { id: true, product: { select: { id: true, slug: true } } },
  });
  if (!review) throw new Error("NOT_FOUND");

  await db.review.update({
    where: { id: reviewId },
    data:
      action === "publish"
        ? { status: "PUBLISHED", isFlagged: false, publishedAt: new Date() }
        : { status: "REMOVED", deletedAt: new Date() },
  });

  revalidatePath(`/app/products/${review.product.id}/reviews`);
  revalidatePath(`/products/${review.product.slug}`);
}
