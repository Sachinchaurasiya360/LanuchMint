"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@launchmint/db";
import { auth } from "@/auth";

const COMMENT_MAX = 2_000;

export interface ToggleUpvoteResult {
  upvoted: boolean;
  count: number;
}

export async function toggleUpvoteAction(productId: string): Promise<ToggleUpvoteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/signin?from=/products`);
  }
  const userId = session.user.id;

  const product = await db.product.findFirst({
    where: { id: productId, status: "LIVE", deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!product) throw new Error("NOT_FOUND");

  const existing = await db.upvote.findUnique({
    where: { productId_userId: { productId, userId } },
    select: { id: true },
  });

  let upvoted: boolean;
  if (existing) {
    await db.upvote.delete({ where: { id: existing.id } });
    upvoted = false;
  } else {
    await db.upvote.create({ data: { productId, userId } });
    upvoted = true;
  }

  const count = await db.upvote.count({ where: { productId } });

  await db.launch.updateMany({
    where: { productId, status: { in: ["LIVE", "ENDED"] } },
    data: { upvoteCount: count },
  });

  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/today");
  return { upvoted, count };
}

export interface PostCommentInput {
  productId: string;
  body: string;
  parentId?: string | null;
}

export async function postCommentAction(input: PostCommentInput) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/signin?from=/products`);
  }
  const userId = session.user.id;

  const body = input.body.trim();
  if (body.length === 0) throw new Error("Comment cannot be empty.");
  if (body.length > COMMENT_MAX) {
    throw new Error(`Comment must be under ${COMMENT_MAX} characters.`);
  }

  const product = await db.product.findFirst({
    where: { id: input.productId, status: "LIVE", deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!product) throw new Error("NOT_FOUND");

  if (input.parentId) {
    const parent = await db.comment.findFirst({
      where: { id: input.parentId, productId: product.id, status: "PUBLISHED" },
      select: { id: true },
    });
    if (!parent) throw new Error("PARENT_NOT_FOUND");
  }

  await db.comment.create({
    data: {
      productId: product.id,
      authorId: userId,
      body,
      parentId: input.parentId ?? null,
      status: "PUBLISHED",
    },
  });

  const total = await db.comment.count({
    where: { productId: product.id, status: "PUBLISHED", deletedAt: null },
  });
  await db.launch.updateMany({
    where: { productId: product.id, status: { in: ["LIVE", "ENDED"] } },
    data: { commentCount: total },
  });

  revalidatePath(`/products/${product.slug}`);
}

export async function deleteOwnCommentAction(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  const userId = session.user.id;

  const comment = await db.comment.findFirst({
    where: { id: commentId, authorId: userId, status: "PUBLISHED" },
    select: { id: true, product: { select: { slug: true, id: true } } },
  });
  if (!comment) throw new Error("NOT_FOUND");

  await db.comment.update({
    where: { id: commentId },
    data: { status: "REMOVED", deletedAt: new Date() },
  });

  const total = await db.comment.count({
    where: { productId: comment.product.id, status: "PUBLISHED", deletedAt: null },
  });
  await db.launch.updateMany({
    where: { productId: comment.product.id, status: { in: ["LIVE", "ENDED"] } },
    data: { commentCount: total },
  });

  revalidatePath(`/products/${comment.product.slug}`);
}
