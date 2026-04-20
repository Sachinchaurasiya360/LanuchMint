import { PLANS, type PlanId, type PlanConfig } from "./plans.js";

export type LimitKey = keyof PlanConfig["limits"];

export type UsageKey =
  | "aiCreditsUsed"
  | "seoChecksUsed"
  | "directorySubmissions"
  | "reviewInvitesSent"
  | "reportsExported";

/**
 * Map of monthly usage counters → the plan limit they are bounded by.
 * Counters that aren't bounded (e.g. `reviewInvitesSent` today) omit the entry.
 */
export const USAGE_TO_LIMIT: Partial<Record<UsageKey, LimitKey>> = {
  aiCreditsUsed: "aiGenerationsPerMonth",
  seoChecksUsed: "seoSnapshotsPerMonth",
};

export interface GateInput {
  plan: PlanId;
  usage?: Partial<Record<UsageKey, number>>;
  currentCounts?: Partial<Record<"products" | "teamMembers" | "trackedDomains" | "integrations", number>>;
}

export interface GateDecision {
  ok: boolean;
  reason?: string;
  limit?: number;
  used?: number;
  remaining?: number;
}

/**
 * Is this workspace allowed to perform `action` right now?
 *
 * Pure function - caller loads plan + current usage/counts from the DB and
 * passes them in. Returns `{ ok: false, reason }` when blocked so the UI can
 * surface an upgrade prompt.
 */
export function can(
  action:
    | { kind: "consume"; usage: UsageKey; amount?: number }
    | { kind: "add"; resource: "products" | "teamMembers" | "trackedDomains" | "integrations" }
    | { kind: "feature"; feature: "verifiedMrrBadge" | "backlinkTracking" | "apiAccess" | "whiteLabel" },
  input: GateInput,
): GateDecision {
  const plan = PLANS[input.plan];
  if (!plan) return { ok: false, reason: "unknown-plan" };

  if (action.kind === "consume") {
    const limitKey = USAGE_TO_LIMIT[action.usage];
    if (!limitKey) return { ok: true };
    const limit = plan.limits[limitKey];
    const used = input.usage?.[action.usage] ?? 0;
    const next = used + (action.amount ?? 1);
    if (next > limit) {
      return {
        ok: false,
        reason: `${action.usage} would exceed ${plan.name} plan limit`,
        limit,
        used,
        remaining: Math.max(0, limit - used),
      };
    }
    return { ok: true, limit, used, remaining: limit - next };
  }

  if (action.kind === "add") {
    const limit = plan.limits[action.resource];
    const used = input.currentCounts?.[action.resource] ?? 0;
    if (used + 1 > limit) {
      return {
        ok: false,
        reason: `${action.resource} limit reached on ${plan.name} plan`,
        limit,
        used,
        remaining: Math.max(0, limit - used),
      };
    }
    return { ok: true, limit, used, remaining: limit - used - 1 };
  }

  // feature gates
  const f = action.feature;
  if (f === "verifiedMrrBadge") return gate(input.plan !== "FREE", "verified MRR badge requires a paid plan");
  if (f === "backlinkTracking") return gate(rank(input.plan) >= rank("GROWTH"), "backlink tracking requires Growth or higher");
  if (f === "apiAccess") return gate(rank(input.plan) >= rank("PRO"), "API access requires Pro or higher");
  if (f === "whiteLabel") return gate(input.plan === "AGENCY", "white-label exports require Agency");
  return { ok: true };
}

function gate(pass: boolean, reason: string): GateDecision {
  return pass ? { ok: true } : { ok: false, reason };
}

const ORDER: PlanId[] = ["FREE", "STARTER", "GROWTH", "PRO", "AGENCY"];
function rank(p: PlanId): number {
  return ORDER.indexOf(p);
}

export interface UsageSummaryRow {
  key: UsageKey;
  label: string;
  used: number;
  limit: number | null;
  percent: number | null;
}

const USAGE_LABELS: Record<UsageKey, string> = {
  aiCreditsUsed: "AI generations",
  seoChecksUsed: "SEO snapshots",
  directorySubmissions: "Directory submissions",
  reviewInvitesSent: "Review invites",
  reportsExported: "Reports exported",
};

/**
 * Render-ready usage summary for the billing meter UI.
 */
export function summarizeUsage(
  plan: PlanId,
  usage: Partial<Record<UsageKey, number>>,
): UsageSummaryRow[] {
  const planCfg = PLANS[plan];
  return (Object.keys(USAGE_LABELS) as UsageKey[]).map((key) => {
    const limitKey = USAGE_TO_LIMIT[key];
    const limit = limitKey ? planCfg.limits[limitKey] : null;
    const used = usage[key] ?? 0;
    const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : null;
    return { key, label: USAGE_LABELS[key], used, limit, percent };
  });
}

/**
 * Derive the next monthly window boundary for a `UsageCounter` row.
 * Anchored to the Subscription's `currentPeriodStart` where available;
 * otherwise uses calendar month.
 */
export function usagePeriodFor(anchor?: Date | null): { start: Date; end: Date } {
  const now = new Date();
  if (anchor) {
    const start = new Date(anchor);
    // roll forward in months until start <= now < start+1mo
    while (addMonths(start, 1) <= now) {
      const next = addMonths(start, 1);
      start.setTime(next.getTime());
    }
    return { start, end: addMonths(start, 1) };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
