"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, ensureUniqueSlug } from "@launchmint/db";
import {
  generateMetaDescription,
  generateMetaTitle,
  generateProductDescription,
} from "@launchmint/ai";
import { requirePermission } from "@launchmint/auth";
import { enqueue } from "@launchmint/queue";
import { scrapeMeta } from "@launchmint/scrape";
import { requireSession } from "@/lib/session";

export interface CreateProductInput {
  name: string;
  tagline: string;
  websiteUrl: string;
  category: string;
  industry?: string;
}

export async function createProductAction(input: CreateProductInput) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "product.create");

  const slug = await ensureUniqueSlug("product", input.name);
  const product = await db.product.create({
    data: {
      workspaceId,
      slug,
      name: input.name.trim(),
      tagline: input.tagline.trim(),
      websiteUrl: input.websiteUrl.trim(),
      category: input.category.trim(),
      industry: input.industry?.trim() || null,
      description: input.tagline.trim(),
      status: "DRAFT",
    },
  });

  await enqueue("index-product", { productId: product.id }).catch(() => {});

  revalidatePath("/app/products");
  redirect(`/app/products/${product.id}/edit`);
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  tagline?: string;
  description?: string;
  websiteUrl?: string;
  category?: string;
  industry?: string;
  pricingModel?: string;
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
  logoUrl?: string;
  ogImageUrl?: string;
  status?: "DRAFT" | "SCHEDULED" | "LIVE" | "ARCHIVED";
}

export async function updateProductAction(input: UpdateProductInput) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "product.update");

  const existing = await db.product.findFirst({
    where: { id: input.id, workspaceId },
    select: { id: true },
  });
  if (!existing) throw new Error("NOT_FOUND");

  const data: Record<string, unknown> = {};
  for (const k of [
    "name",
    "tagline",
    "description",
    "websiteUrl",
    "category",
    "industry",
    "pricingModel",
    "metaTitle",
    "metaDescription",
    "logoUrl",
    "ogImageUrl",
    "status",
  ] as const) {
    const v = input[k];
    if (typeof v === "string") data[k] = v.trim();
  }
  if (input.seoKeywords) data.seoKeywords = input.seoKeywords;
  if (input.status === "LIVE") data.publishedAt = new Date();

  const updated = await db.product.update({ where: { id: input.id }, data });
  await enqueue("index-product", { productId: updated.id }).catch(() => {});

  revalidatePath(`/app/products/${updated.id}/edit`);
  revalidatePath(`/products/${updated.slug}`);
  revalidatePath("/app/products");
  return { id: updated.id, slug: updated.slug };
}

export async function deleteProductAction(productId: string) {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "product.delete");

  const existing = await db.product.findFirst({
    where: { id: productId, workspaceId },
    select: { id: true },
  });
  if (!existing) throw new Error("NOT_FOUND");

  await db.product.update({
    where: { id: productId },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });
  revalidatePath("/app/products");
  redirect("/app/products");
}

export interface PrefillResult {
  description: string;
  metaTitle: string;
  metaDescription: string;
}

export async function aiPrefillAction(productId: string): Promise<PrefillResult> {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "product.update");

  const product = await db.product.findFirst({
    where: { id: productId, workspaceId },
  });
  if (!product) throw new Error("NOT_FOUND");

  const [desc, title, metaDesc] = await Promise.all([
    generateProductDescription({
      workspaceId,
      name: product.name,
      tagline: product.tagline,
      category: product.category,
      audience: "indie founders, SaaS buyers",
      features: [],
    }),
    generateMetaTitle({
      workspaceId,
      productName: product.name,
      tagline: product.tagline,
      category: product.category,
    }),
    generateMetaDescription({
      workspaceId,
      productName: product.name,
      tagline: product.tagline,
      category: product.category,
      primaryBenefit: product.tagline,
    }),
  ]);

  const result: PrefillResult = {
    description: desc.text.trim(),
    metaTitle: title.text.trim(),
    metaDescription: metaDesc.text.trim(),
  };

  await db.product.update({
    where: { id: product.id },
    data: result,
  });

  revalidatePath(`/app/products/${product.id}/edit`);
  return result;
}

export async function scrapeUrlAction(url: string) {
  const { ctx } = await requireSession();
  requirePermission(ctx, "product.create");
  return scrapeMeta(url);
}
