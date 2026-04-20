import type { MetadataRoute } from "next";
import { db } from "@launchmint/db";
import { SITE, abs } from "@launchmint/seo-meta";
import { CATEGORIES, categorySlug } from "@/lib/categories";

export const revalidate = 3600;

type Kind = "core" | "products" | "founders" | "launches" | "directories" | "categories" | "best" | "compare";

export async function generateSitemaps(): Promise<{ id: Kind }[]> {
  return [
    { id: "core" },
    { id: "products" },
    { id: "founders" },
    { id: "launches" },
    { id: "directories" },
    { id: "categories" },
    { id: "best" },
    { id: "compare" },
  ];
}

export default async function sitemap({
  id,
}: {
  id: Kind;
}): Promise<MetadataRoute.Sitemap> {
  switch (id) {
    case "core":
      return coreSitemap();
    case "products":
      return productsSitemap();
    case "founders":
      return foundersSitemap();
    case "launches":
      return launchesSitemap();
    case "directories":
      return directoriesSitemap();
    case "categories":
      return categoriesSitemap();
    case "best":
      return bestSitemap();
    case "compare":
      return compareSitemap();
  }
}

function coreSitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: abs("/today"), lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: abs("/directories"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/categories"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/founders"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/pricing"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}

async function productsSitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({
    where: { status: "LIVE", deletedAt: null },
    select: { slug: true, updatedAt: true },
    take: 50_000,
  });
  return products.map((p) => ({
    url: abs(`/products/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
}

async function foundersSitemap(): Promise<MetadataRoute.Sitemap> {
  const founders = await db.founderProfile.findMany({
    where: { publishedAt: { not: null }, deletedAt: null },
    select: { slug: true, updatedAt: true },
    take: 50_000,
  });
  return founders.map((f) => ({
    url: abs(`/founders/${f.slug}`),
    lastModified: f.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}

async function launchesSitemap(): Promise<MetadataRoute.Sitemap> {
  const launches = await db.launch.findMany({
    where: { goneLiveAt: { not: null } },
    select: { goneLiveAt: true },
    take: 50_000,
  });
  const days = new Set<string>();
  for (const l of launches) {
    if (l.goneLiveAt) days.add(l.goneLiveAt.toISOString().slice(0, 10));
  }
  return Array.from(days).map((d) => ({
    url: abs(`/launches/${d}`),
    lastModified: new Date(`${d}T23:59:59Z`),
    changeFrequency: "monthly",
    priority: 0.4,
  }));
}

async function directoriesSitemap(): Promise<MetadataRoute.Sitemap> {
  const directories = await db.directory.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
    take: 50_000,
  });
  return directories.map((d) => ({
    url: abs(`/directories/${d.slug}`),
    lastModified: d.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));
}

function categoriesSitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return CATEGORIES.map((c) => ({
    url: abs(`/categories/${categorySlug(c)}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
}

function bestSitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return CATEGORIES.map((c) => ({
    url: abs(`/best/${categorySlug(c)}`),
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));
}

/**
 * Emit compare pairs that meet the quality threshold: same category, both LIVE,
 * both with non-trivial descriptions. Capped at top-6-per-category to avoid
 * a quadratic blowup as the product count grows.
 */
async function compareSitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({
    where: {
      status: "LIVE",
      deletedAt: null,
      description: { not: "" },
    },
    select: {
      slug: true,
      category: true,
      description: true,
      launchScore: true,
      updatedAt: true,
    },
    take: 5_000,
  });
  const byCategory = new Map<string, typeof products>();
  for (const p of products) {
    if ((p.description ?? "").length < 120) continue;
    const arr = byCategory.get(p.category) ?? [];
    arr.push(p);
    byCategory.set(p.category, arr);
  }

  const entries: MetadataRoute.Sitemap = [];
  for (const list of byCategory.values()) {
    const top = list
      .sort((a, b) => (b.launchScore ?? 0) - (a.launchScore ?? 0))
      .slice(0, 6);
    for (let i = 0; i < top.length; i++) {
      for (let j = i + 1; j < top.length; j++) {
        const a = top[i]!;
        const b = top[j]!;
        entries.push({
          url: abs(`/compare/${a.slug}-vs-${b.slug}`),
          lastModified: a.updatedAt > b.updatedAt ? a.updatedAt : b.updatedAt,
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
    }
  }
  return entries;
}
