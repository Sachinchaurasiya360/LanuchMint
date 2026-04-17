"use server";

import { revalidatePath } from "next/cache";
import { db } from "@launchmint/db";
import { requirePermission } from "@launchmint/auth";
import { enqueue } from "@launchmint/queue";
import { requireSession } from "@/lib/session";

export interface ScheduleLaunchInput {
  productId: string;
  scheduledAt: string;
  timezone?: string;
}

export async function scheduleLaunchAction(input: ScheduleLaunchInput) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "launch.schedule");

  const product = await db.product.findFirst({
    where: { id: input.productId, workspaceId, deletedAt: null },
    select: { id: true },
  });
  if (!product) throw new Error("NOT_FOUND");

  const scheduledAt = new Date(input.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) throw new Error("INVALID_DATE");
  if (scheduledAt.getTime() < Date.now() + 5 * 60_000) {
    throw new Error("Schedule a launch at least 5 minutes from now.");
  }

  await db.launch.updateMany({
    where: { productId: product.id, status: "SCHEDULED" },
    data: { status: "CANCELLED", endedAt: new Date() },
  });

  const launch = await db.launch.create({
    data: {
      productId: product.id,
      scheduledAt,
      timezone: input.timezone ?? "UTC",
      status: "SCHEDULED",
    },
  });

  await db.product.update({
    where: { id: product.id },
    data: { status: "SCHEDULED" },
  });

  await enqueue("ai-launch-readiness", {
    productId: product.id,
    workspaceId,
  }).catch(() => {});

  revalidatePath("/app/launches");
  revalidatePath("/app/products");
  return { id: launch.id };
}

export async function cancelLaunchAction(launchId: string) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "launch.schedule");

  const launch = await db.launch.findFirst({
    where: { id: launchId, product: { workspaceId } },
    select: { id: true, productId: true, status: true },
  });
  if (!launch) throw new Error("NOT_FOUND");
  if (launch.status !== "SCHEDULED") {
    throw new Error("Only SCHEDULED launches can be cancelled.");
  }

  await db.launch.update({
    where: { id: launchId },
    data: { status: "CANCELLED", endedAt: new Date() },
  });

  await db.product.update({
    where: { id: launch.productId },
    data: { status: "DRAFT" },
  });

  revalidatePath("/app/launches");
  revalidatePath("/app/products");
}

export async function recomputeReadinessAction(productId: string) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "launch.schedule");

  const product = await db.product.findFirst({
    where: { id: productId, workspaceId, deletedAt: null },
    select: { id: true },
  });
  if (!product) throw new Error("NOT_FOUND");

  await enqueue("ai-launch-readiness", { productId, workspaceId });
  revalidatePath("/app/launches");
}
