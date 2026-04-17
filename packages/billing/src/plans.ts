/**
 * Pricing plans. Prices are in USD; Razorpay charges in INR with FX
 * conversion at the gateway. Update when pricing changes.
 */
export type PlanId = "FREE" | "STARTER" | "GROWTH" | "PRO" | "AGENCY";

export interface PlanConfig {
  id: PlanId;
  name: string;
  priceMonthlyUsd: number;
  priceYearlyUsd: number;
  razorpayPlanIdMonthly?: string;
  razorpayPlanIdYearly?: string;
  limits: {
    products: number;
    teamMembers: number;
    aiGenerationsPerMonth: number;
    trackedDomains: number;
    seoSnapshotsPerMonth: number;
    integrations: number;
  };
  features: string[];
}

export const PLANS: Record<PlanId, PlanConfig> = {
  FREE: {
    id: "FREE",
    name: "Free",
    priceMonthlyUsd: 0,
    priceYearlyUsd: 0,
    limits: {
      products: 1,
      teamMembers: 1,
      aiGenerationsPerMonth: 20,
      trackedDomains: 1,
      seoSnapshotsPerMonth: 4,
      integrations: 1,
    },
    features: ["1 product", "Basic launch page", "1 tracked domain", "Community support"],
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    priceMonthlyUsd: 29,
    priceYearlyUsd: 290,
    razorpayPlanIdMonthly: process.env.RAZORPAY_PLAN_STARTER_MONTHLY,
    razorpayPlanIdYearly: process.env.RAZORPAY_PLAN_STARTER_YEARLY,
    limits: {
      products: 3,
      teamMembers: 2,
      aiGenerationsPerMonth: 200,
      trackedDomains: 3,
      seoSnapshotsPerMonth: 30,
      integrations: 3,
    },
    features: ["3 products", "AI meta + descriptions", "Verified MRR badge", "Email support"],
  },
  GROWTH: {
    id: "GROWTH",
    name: "Growth",
    priceMonthlyUsd: 79,
    priceYearlyUsd: 790,
    razorpayPlanIdMonthly: process.env.RAZORPAY_PLAN_GROWTH_MONTHLY,
    razorpayPlanIdYearly: process.env.RAZORPAY_PLAN_GROWTH_YEARLY,
    limits: {
      products: 10,
      teamMembers: 5,
      aiGenerationsPerMonth: 1_000,
      trackedDomains: 10,
      seoSnapshotsPerMonth: 120,
      integrations: 10,
    },
    features: [
      "10 products",
      "Backlink + keyword tracking",
      "Directory auto-submit",
      "Priority support",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    priceMonthlyUsd: 149,
    priceYearlyUsd: 1490,
    razorpayPlanIdMonthly: process.env.RAZORPAY_PLAN_PRO_MONTHLY,
    razorpayPlanIdYearly: process.env.RAZORPAY_PLAN_PRO_YEARLY,
    limits: {
      products: 25,
      teamMembers: 15,
      aiGenerationsPerMonth: 5_000,
      trackedDomains: 25,
      seoSnapshotsPerMonth: 500,
      integrations: 25,
    },
    features: ["Everything in Growth", "API access", "Custom domains", "SLA support"],
  },
  AGENCY: {
    id: "AGENCY",
    name: "Agency",
    priceMonthlyUsd: 299,
    priceYearlyUsd: 2_990,
    razorpayPlanIdMonthly: process.env.RAZORPAY_PLAN_AGENCY_MONTHLY,
    razorpayPlanIdYearly: process.env.RAZORPAY_PLAN_AGENCY_YEARLY,
    limits: {
      products: 100,
      teamMembers: 50,
      aiGenerationsPerMonth: 20_000,
      trackedDomains: 100,
      seoSnapshotsPerMonth: 2_000,
      integrations: 100,
    },
    features: [
      "Multi-client workspaces",
      "White-label reports",
      "Dedicated account manager",
    ],
  },
};
