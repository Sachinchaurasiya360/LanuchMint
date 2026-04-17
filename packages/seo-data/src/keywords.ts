import { cached } from "./cache.js";
import { dfsPost } from "./client.js";

export interface KeywordRankEntry {
  keyword: string;
  position: number | null;
  url: string | null;
  searchVolume: number | null;
}

interface DfsSerpResponse {
  tasks?: {
    result?: {
      items?: {
        keyword?: string;
        rank_group?: number;
        url?: string;
        search_volume?: number;
      }[];
    }[];
  }[];
}

export async function getKeywordRankings(
  domain: string,
  keywords: string[],
  locationCode = 2840,
): Promise<KeywordRankEntry[]> {
  if (keywords.length === 0) return [];
  const target = domain.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
  const cacheKey = `keywords:${target}:${locationCode}:${keywords.slice().sort().join("|")}`;

  return cached(cacheKey, 60 * 60 * 6, async () => {
    const res = await dfsPost<DfsSerpResponse>(
      "/dataforseo_labs/google/ranked_keywords/live",
      [{ target, location_code: locationCode, limit: keywords.length * 2 }],
    );
    const items = res.tasks?.[0]?.result?.[0]?.items ?? [];
    return keywords.map((kw) => {
      const hit = items.find((i) => i.keyword === kw);
      return {
        keyword: kw,
        position: hit?.rank_group ?? null,
        url: hit?.url ?? null,
        searchVolume: hit?.search_volume ?? null,
      };
    });
  });
}
