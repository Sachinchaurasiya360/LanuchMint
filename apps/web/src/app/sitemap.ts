import type { MetadataRoute } from "next";
import { db } from "@launchmint/db";
import { SITE, abs } from "@launchmint/seo-meta";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, founders, launchDays, directories] = await Promise.all([
    db.product.findMany({
      where: { status: "LIVE", deletedAt: null },
      select: { slug: true, updatedAt: true },
      take: 5_000,
    }),
    db.founderProfile.findMany({
      where: { publishedAt: { not: null }, deletedAt: null },
      select: { slug: true, updatedAt: true },
      take: 5_000,
    }),
    db.launch.findMany({
      where: { goneLiveAt: { not: null } },
      select: { goneLiveAt: true },
      take: 5_000,
    }),
    db.directory.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
      take: 5_000,
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: abs("/today"), lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: abs("/directories"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/pricing"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/about"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: abs(`/products/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const founderEntries: MetadataRoute.Sitemap = founders.map((f) => ({
    url: abs(`/founders/${f.slug}`),
    lastModified: f.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const days = new Set<string>();
  for (const l of launchDays) {
    if (l.goneLiveAt) days.add(l.goneLiveAt.toISOString().slice(0, 10));
  }
  const launchDayEntries: MetadataRoute.Sitemap = Array.from(days).map((d) => ({
    url: abs(`/launches/${d}`),
    lastModified: new Date(`${d}T23:59:59Z`),
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const directoryEntries: MetadataRoute.Sitemap = directories.map((d) => ({
    url: abs(`/directories/${d.slug}`),
    lastModified: d.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    ...staticEntries,
    ...productEntries,
    ...founderEntries,
    ...launchDayEntries,
    ...directoryEntries,
  ];
}
