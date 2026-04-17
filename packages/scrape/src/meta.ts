import * as cheerio from "cheerio";

export interface ScrapedMeta {
  url: string;
  finalUrl: string;
  title: string | null;
  description: string | null;
  ogImage: string | null;
  favicon: string | null;
  themeColor: string | null;
  siteName: string | null;
  twitterHandle: string | null;
}

const TIMEOUT_MS = 10_000;
const UA =
  "Mozilla/5.0 (compatible; LaunchMintBot/1.0; +https://launchmint.com/bot)";

export async function scrapeMeta(rawUrl: string): Promise<ScrapedMeta> {
  const url = normalizeUrl(rawUrl);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,*/*" },
      redirect: "follow",
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new Error(`scrape failed (${res.status}) for ${url}`);
  }

  const finalUrl = res.url || url;
  const html = await res.text();
  const $ = cheerio.load(html);

  const meta = (name: string) =>
    $(`meta[name="${name}"]`).attr("content") ??
    $(`meta[property="${name}"]`).attr("content") ??
    null;

  const title =
    meta("og:title") ?? $("title").first().text().trim() ?? meta("twitter:title");

  const description =
    meta("description") ??
    meta("og:description") ??
    meta("twitter:description");

  const ogImage = meta("og:image") ?? meta("twitter:image");

  const faviconHref =
    $('link[rel="icon"]').attr("href") ??
    $('link[rel="shortcut icon"]').attr("href") ??
    "/favicon.ico";

  return {
    url,
    finalUrl,
    title: title ? title.trim().slice(0, 200) : null,
    description: description ? description.trim().slice(0, 320) : null,
    ogImage: ogImage ? absoluteUrl(finalUrl, ogImage) : null,
    favicon: absoluteUrl(finalUrl, faviconHref),
    themeColor: meta("theme-color"),
    siteName: meta("og:site_name"),
    twitterHandle: meta("twitter:site"),
  };
}

function normalizeUrl(input: string): string {
  let s = input.trim();
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  return s;
}

function absoluteUrl(base: string, href: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}
