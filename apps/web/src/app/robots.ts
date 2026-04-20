import type { MetadataRoute } from "next";
import { SITE } from "@launchmint/seo-meta";

/**
 * robots.txt - two-tier allowlist:
 *   1. "*" gets the site minus /app/ (authenticated dashboard) and /api/.
 *   2. Named AI crawlers explicitly get /llms.txt + /llms-full.txt so they
 *      retrieve the curated text index rather than crawling HTML.
 *
 * GPTBot, ClaudeBot, PerplexityBot, and Google-Extended are the bots that
 * respect robots.txt today. We explicitly allow them - opting out here just
 * makes us invisible in AI answers, which is the opposite of what we want.
 */
export default function robots(): MetadataRoute.Robots {
  const aiBots = [
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Bingbot",
    "Applebot-Extended",
    "CCBot",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/api/"],
      },
      ...aiBots.map((userAgent) => ({
        userAgent,
        allow: ["/", "/llms.txt", "/llms-full.txt"],
        disallow: ["/app/", "/api/"],
      })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
