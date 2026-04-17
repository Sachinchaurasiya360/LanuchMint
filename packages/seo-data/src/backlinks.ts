import { cached } from "./cache.js";
import { dfsPost } from "./client.js";

export interface BacklinkSummary {
  target: string;
  totalBacklinks: number;
  referringDomains: number;
  rank: number;
  fetchedAt: string;
}

interface DfsBacklinksSummaryResponse {
  tasks?: {
    result?: {
      total_backlinks?: number;
      referring_domains?: number;
      rank?: number;
    }[];
  }[];
}

export async function getBacklinkSummary(domain: string): Promise<BacklinkSummary> {
  const target = normalizeDomain(domain);
  return cached(`backlinks:summary:${target}`, 60 * 60 * 24, async () => {
    const res = await dfsPost<DfsBacklinksSummaryResponse>(
      "/backlinks/summary/live",
      [{ target, internal_list_limit: 1, backlinks_status_type: "live" }],
    );
    const r = res.tasks?.[0]?.result?.[0];
    return {
      target,
      totalBacklinks: r?.total_backlinks ?? 0,
      referringDomains: r?.referring_domains ?? 0,
      rank: r?.rank ?? 0,
      fetchedAt: new Date().toISOString(),
    };
  });
}

function normalizeDomain(input: string): string {
  return input.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
}
