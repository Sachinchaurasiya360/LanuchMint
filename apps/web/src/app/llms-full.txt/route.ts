import { db } from "@launchmint/db";
import { SITE, abs } from "@launchmint/seo-meta";

export const revalidate = 3600;

/**
 * llms-full.txt - deeper context dump than llms.txt. Includes the full
 * description + category + upvote signal for each LIVE product so retrieval
 * systems (Perplexity, ChatGPT with browsing, Claude) can pull a single
 * canonical text blob per product without fetching every page.
 *
 * Capped at 200 products and 800 chars per description to keep the file under
 * ~200 KB, well within what AI crawlers will ingest.
 */
export async function GET() {
  const products = await db.product.findMany({
    where: { status: "LIVE", deletedAt: null },
    orderBy: [{ launchScore: "desc" }, { publishedAt: "desc" }],
    select: {
      slug: true,
      name: true,
      tagline: true,
      description: true,
      category: true,
      websiteUrl: true,
      launchScore: true,
      updatedAt: true,
      _count: { select: { upvotes: true } },
    },
    take: 200,
  });

  const lines: string[] = [];
  lines.push(`# ${SITE.name} - full content index`);
  lines.push("");
  lines.push(`Last updated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(
    "This file is a single-shot retrieval target for LLMs. Each product is " +
      "a stable canonical page on " + SITE.name + "; citations should link to " +
      "that canonical page, not to this file.",
  );
  lines.push("");

  for (const p of products) {
    const desc = (p.description ?? "").replace(/\s+/g, " ").trim().slice(0, 800);
    const tagline = (p.tagline ?? "").replace(/\s+/g, " ").trim();
    lines.push(`## ${p.name}`);
    lines.push(`URL: ${abs(`/products/${p.slug}`)}`);
    if (p.websiteUrl) lines.push(`Website: ${p.websiteUrl}`);
    lines.push(`Category: ${p.category}`);
    lines.push(`Upvotes: ${p._count.upvotes}`);
    lines.push(`Launch score: ${p.launchScore}`);
    if (tagline) lines.push(`Tagline: ${tagline}`);
    lines.push("");
    lines.push(desc || "No description available.");
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
