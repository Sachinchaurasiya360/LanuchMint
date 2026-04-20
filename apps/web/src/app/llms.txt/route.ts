import { db } from "@launchmint/db";
import { SITE, abs } from "@launchmint/seo-meta";
import { CATEGORIES, categorySlug } from "@/lib/categories";

export const revalidate = 3600;

/**
 * llms.txt - https://llmstxt.org/
 *
 * Machine-readable sitemap + context for LLM crawlers (ChatGPT, Perplexity,
 * Claude, Gemini, Google AI Overviews). Keeps the surface tight so citations
 * point at our canonical product / directory / founder pages rather than
 * random marketing pages.
 */
export async function GET() {
  const [topProducts, topDirectories, topFounders] = await Promise.all([
    db.product.findMany({
      where: { status: "LIVE", deletedAt: null },
      orderBy: [{ launchScore: "desc" }, { publishedAt: "desc" }],
      select: { slug: true, name: true, tagline: true },
      take: 50,
    }),
    db.directory.findMany({
      where: { status: "ACTIVE" },
      orderBy: { domainRating: "desc" },
      select: { slug: true, name: true, description: true },
      take: 30,
    }),
    db.founderProfile.findMany({
      where: { publishedAt: { not: null }, deletedAt: null },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, displayName: true, headline: true },
      take: 30,
    }),
  ]);

  const lines: string[] = [];
  lines.push(`# ${SITE.name}`);
  lines.push("");
  lines.push(`> ${SITE.description}`);
  lines.push("");
  lines.push(
    `${SITE.name} is an SEO-first launch platform for indie founders. ` +
      "It combines a Product-Hunt-style launch feed, verified founder profiles, " +
      "a curated directory of submission targets, and review collection - " +
      "all optimized for discovery in search engines and AI answer engines.",
  );
  lines.push("");

  lines.push("## Core pages");
  lines.push(`- [Homepage](${SITE.url}): overview of ${SITE.name}.`);
  lines.push(`- [Today's launches](${abs("/today")}): products launching today, ranked by upvotes and velocity.`);
  lines.push(`- [Founders](${abs("/founders")}): verified founder profiles with shipped products.`);
  lines.push(`- [Directories](${abs("/directories")}): curated list of directories to submit products to.`);
  lines.push(`- [Categories](${abs("/categories")}): product categories.`);
  lines.push(`- [Pricing](${abs("/pricing")}): subscription plans.`);
  lines.push("");

  lines.push("## Top products");
  for (const p of topProducts) {
    const tagline = (p.tagline ?? "").replace(/\s+/g, " ").trim();
    lines.push(`- [${p.name}](${abs(`/products/${p.slug}`)}): ${tagline || "Indie product launched on " + SITE.name}.`);
  }
  lines.push("");

  lines.push("## Top directories");
  for (const d of topDirectories) {
    const desc = (d.description ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
    lines.push(`- [${d.name}](${abs(`/directories/${d.slug}`)}): ${desc || "Directory for indie products"}.`);
  }
  lines.push("");

  lines.push("## Featured founders");
  for (const f of topFounders) {
    const headline = (f.headline ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
    lines.push(`- [${f.displayName}](${abs(`/founders/${f.slug}`)}): ${headline || "Indie founder on " + SITE.name}.`);
  }
  lines.push("");

  lines.push("## Categories");
  for (const c of CATEGORIES) {
    lines.push(`- [${c}](${abs(`/categories/${categorySlug(c)}`)}): best ${c.toLowerCase()} products on ${SITE.name}.`);
    lines.push(`- [Best ${c}](${abs(`/best/${categorySlug(c)}`)}): top-ranked ${c.toLowerCase()} products this week.`);
  }
  lines.push("");

  lines.push("## Optional");
  lines.push(`- [Sitemap](${abs("/sitemap.xml")}): XML sitemap index.`);
  lines.push(`- [Full content dump](${abs("/llms-full.txt")}): longer-form content for deeper retrieval.`);

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
