"use server";

import { revalidatePath } from "next/cache";
import { db } from "@launchmint/db";
import { generateDirectoryDescription } from "@launchmint/ai";
import { requirePermission } from "@launchmint/auth";
import { enqueue } from "@launchmint/queue";
import { requireSession } from "@/lib/session";

export async function recommendDirectoriesAction(productId: string) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "directory.submit");

  const product = await db.product.findFirst({
    where: { id: productId, workspaceId, deletedAt: null },
    select: { id: true },
  });
  if (!product) throw new Error("NOT_FOUND");

  await enqueue("ai-recommend-directories", {
    productId: product.id,
    workspaceId,
  });
  revalidatePath(`/app/products/${product.id}/directories`);
}

export async function startSubmissionAction(input: {
  productId: string;
  directoryId: string;
}) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "directory.submit");

  const product = await db.product.findFirst({
    where: { id: input.productId, workspaceId, deletedAt: null },
    select: { id: true },
  });
  if (!product) throw new Error("NOT_FOUND");

  const submission = await db.directorySubmission.upsert({
    where: {
      productId_directoryId: {
        productId: product.id,
        directoryId: input.directoryId,
      },
    },
    create: {
      productId: product.id,
      directoryId: input.directoryId,
      workspaceId,
      status: "PENDING",
    },
    update: {},
    select: { id: true },
  });

  await enqueue("submit-directory", { submissionId: submission.id });
  revalidatePath(`/app/products/${product.id}/directories`);
}

export async function regenerateDescriptionAction(submissionId: string) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "directory.submit");

  const submission = await db.directorySubmission.findFirst({
    where: { id: submissionId, workspaceId },
    include: {
      directory: true,
      product: {
        select: {
          name: true,
          tagline: true,
          description: true,
          category: true,
          websiteUrl: true,
        },
      },
    },
  });
  if (!submission) throw new Error("NOT_FOUND");

  const r = await generateDirectoryDescription({
    workspaceId,
    productId: submission.productId,
    productName: submission.product.name,
    productTagline: submission.product.tagline,
    productDescription: submission.product.description,
    productCategory: submission.product.category,
    productUrl: submission.product.websiteUrl,
    directoryName: submission.directory.name,
    directoryNiche: submission.directory.niche,
    directoryAudience: "early-stage founders",
    maxLength: 280,
  });

  await db.directorySubmission.update({
    where: { id: submission.id },
    data: { generatedDescription: r.description },
  });
  revalidatePath(`/app/products/${submission.productId}/directories`);
  return r.description;
}

export async function markSubmittedAction(input: {
  submissionId: string;
  liveUrl?: string;
}) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "directory.submit");

  const submission = await db.directorySubmission.findFirst({
    where: { id: input.submissionId, workspaceId },
    select: { id: true, productId: true },
  });
  if (!submission) throw new Error("NOT_FOUND");

  const liveUrl = input.liveUrl?.trim();
  await db.directorySubmission.update({
    where: { id: submission.id },
    data: {
      status: liveUrl ? "LIVE" : "SUBMITTED",
      submittedAt: new Date(),
      livedAt: liveUrl ? new Date() : null,
      liveUrl: liveUrl ?? null,
    },
  });

  if (!liveUrl) {
    await enqueue("verify-directory-backlink", { submissionId: submission.id });
  }
  revalidatePath(`/app/products/${submission.productId}/directories`);
}

export async function dismissSubmissionAction(submissionId: string) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "directory.submit");

  const submission = await db.directorySubmission.findFirst({
    where: { id: submissionId, workspaceId },
    select: { id: true, productId: true, status: true },
  });
  if (!submission) throw new Error("NOT_FOUND");

  // Only allow dismissing not-yet-acted-on rows.
  if (submission.status !== "PENDING" && submission.status !== "REJECTED") {
    throw new Error("CANNOT_DISMISS");
  }
  await db.directorySubmission.update({
    where: { id: submission.id },
    data: { status: "REJECTED", rejectedAt: new Date() },
  });
  revalidatePath(`/app/products/${submission.productId}/directories`);
}
