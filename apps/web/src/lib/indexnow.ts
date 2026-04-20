import { SITE } from "@launchmint/seo-meta";

/**
 * Submit a batch of URLs to Bing/Yandex IndexNow. No-ops when no key is set.
 * Never throws - indexing is best-effort.
 *
 * Verification: `/api/v1/indexnow/key` returns the key as plain text; IndexNow
 * supports any same-host keyLocation, so we avoid a root-level `.txt` route.
 */
export async function submitIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key || urls.length === 0) return;

  const host = new URL(SITE.url).host;
  const body = {
    host,
    key,
    keyLocation: `${SITE.url}/api/v1/indexnow/key`,
    urlList: urls.slice(0, 10_000),
  };

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[indexnow] submit failed", err);
  }
}
