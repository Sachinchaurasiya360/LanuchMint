/**
 * Event taxonomy — keep in sync with docs/ONBOARDING.md analytics section.
 * Names use snake_case verb_object format.
 */

export interface EventMap {
  user_signed_up: { method: "google" | "magic_link"; referrer?: string };
  user_signed_in: { method: "google" | "magic_link" };
  workspace_created: { workspaceId: string; type: "FOUNDER" | "AGENCY" };
  product_created: { workspaceId: string; productId: string; category: string };
  product_published: { workspaceId: string; productId: string };
  launch_scheduled: { workspaceId: string; productId: string; launchAt: string };
  launch_started: { workspaceId: string; launchId: string };
  review_submitted: { workspaceId: string; productId: string; rating: number };
  upvote_cast: { productId: string };
  comment_posted: { entityType: "product" | "review" | "launch"; entityId: string };
  directory_submitted: { directorySlug: string; productId: string };
  ai_generation: { purpose: string; model: string; costUsd: number };
  seo_snapshot_taken: { trackedDomainId: string };
  subscription_started: { plan: string; intervalMonths: number };
  subscription_canceled: { plan: string; reason?: string };
  referral_converted: { referrerId: string; refereeId: string };
  badge_awarded: { userId: string; badgeSlug: string };
  search_performed: { query: string; resultsCount: number };
  cta_clicked: { location: string; cta: string };
}

export type EventName = keyof EventMap;
