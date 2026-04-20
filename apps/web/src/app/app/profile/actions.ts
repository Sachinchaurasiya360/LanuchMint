"use server";

import { revalidatePath } from "next/cache";
import { db, ensureUniqueSlug } from "@launchmint/db";
import { enqueue } from "@launchmint/queue";
import { requireSession } from "@/lib/session";

export interface FounderProfileInput {
  displayName: string;
  headline?: string;
  bio?: string;
  location?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  githubUrl?: string;
  publish?: boolean;
}

export async function upsertFounderProfileAction(input: FounderProfileInput) {
  const { workspaceId, userId } = await requireSession();

  const existing = await db.founderProfile.findUnique({
    where: { workspaceId },
  });

  const data = {
    displayName: input.displayName.trim(),
    headline: input.headline?.trim() || null,
    bio: input.bio?.trim() || null,
    location: input.location?.trim() || null,
    twitterUrl: input.twitterUrl?.trim() || null,
    linkedinUrl: input.linkedinUrl?.trim() || null,
    websiteUrl: input.websiteUrl?.trim() || null,
    githubUrl: input.githubUrl?.trim() || null,
    publishedAt: input.publish ? new Date() : existing?.publishedAt ?? null,
  };

  if (existing) {
    await db.founderProfile.update({ where: { workspaceId }, data });
  } else {
    const slug = await ensureUniqueSlug("founderProfile", input.displayName);
    await db.founderProfile.create({
      data: { ...data, slug, workspaceId, userId },
    });
  }

  await enqueue("index-founder", { userId }).catch(() => {});

  revalidatePath("/app/profile");
  if (existing?.slug) revalidatePath(`/founders/${existing.slug}`);
  return { ok: true };
}
