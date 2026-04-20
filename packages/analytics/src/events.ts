/**
 * Event taxonomy - keep in sync with docs/ONBOARDING.md analytics section.
 * Names use snake_case verb_object format.
 */

export interface EventMap {
  // Auth & lifecycle
  user_signed_up: { method: "google" | "magic_link"; source?: string; ref?: string };
  user_signed_in: { method: "google" | "magic_link" };
  user_completed_onboarding: { stepsSkipped: number; timeToCompleteSeconds: number };
  user_deleted_account: { reason?: string };

  // Workspace
  workspace_created: { workspaceId: string; type: "FOUNDER" | "AGENCY" };
  workspace_switched: { workspaceId: string };

  // Product
  product_created: { workspaceId: string; productId: string; category: string; source: "onboarding" | "manual" };
  product_published: { workspaceId: string; productId: string; launchScore: number };
  product_updated: { productId: string; fieldsChanged: string[] };
  product_archived: { productId: string };
  product_scrape_initiated: { productId: string };
  product_scrape_completed: { productId: string; durationMs: number; success: boolean };

  // Launch
  launch_scheduled: { workspaceId: string; productId: string; launchAt: string; daysOut: number };
  launch_went_live: { productId: string; launchScore: number };
  launch_ended: { productId: string; finalRank: number; totalUpvotes: number; totalComments: number };
  upvote_cast: { productId: string };
  upvote_removed: { productId: string };
  comment_posted: { entityType: "product" | "review" | "launch"; entityId: string; parentId?: string };

  // Reviews
  review_invite_sent: { productId: string; count: number };
  review_invite_clicked: { token: string };
  review_submitted: { productId: string; rating: number; verified: boolean; fakeScore?: number };
  review_replied: { reviewId: string };
  review_flagged: { reviewId: string; by: "user" | "ai" };
  review_moderated: { reviewId: string; decision: "approve" | "remove" | "flag" };

  // Directories
  directory_viewed: { directoryId: string };
  directory_selected: { directoryId: string; productId: string };
  directory_submitted: { directoryId: string; productId: string; method: "auto" | "manual" };
  directory_went_live: { directoryId: string; productId: string; daysToLive: number };
  directory_rejected: { directoryId: string; productId: string };
  directory_recommendations_loaded: { productId: string; count: number };

  // SEO
  seo_dashboard_viewed: { productId: string };
  seo_domain_added: { productId: string; domain: string };
  seo_competitor_added: { productId: string; competitorDomain: string };
  seo_refresh_triggered: { productId: string; type: string };
  seo_snapshot_taken: { trackedDomainId: string };
  backlink_alert_triggered: { productId: string; type: "gained" | "lost"; count: number };
  keyword_added: { productId: string; keyword: string };

  // AI
  ai_generation_requested: { type: string; model: string; creditsCharged: number; latencyMs: number; status: "ok" | "error" };
  ai_generation_accepted: { generationId: string };
  ai_generation_rejected: { generationId: string; reason: string };
  ai_quota_warning: { workspaceId: string; percentUsed: number };
  ai_quota_exceeded: { workspaceId: string };

  // MRR
  mrr_widget_connected: { workspaceId: string };
  mrr_synced: { productId: string; mrrCents: number; currency: string };
  mrr_disconnected: { workspaceId: string };

  // Billing
  billing_pricing_viewed: Record<string, never>;
  billing_checkout_started: { plan: string; interval: string };
  billing_checkout_completed: { plan: string; interval: string; amountCents: number };
  subscription_started: { plan: string; intervalMonths: number };
  subscription_canceled: { plan: string; reason?: string };
  billing_upgraded: { from: string; to: string };
  billing_downgraded: { from: string; to: string };
  billing_payment_failed: { plan: string };
  billing_renewed: { plan: string };

  // Growth
  referral_link_shared: { channel: string };
  referral_signup: { code: string };
  referral_converted: { referrerId: string; refereeId: string; code?: string; plan?: string };
  affiliate_signup: { code: string };
  affiliate_conversion: { code: string; plan: string };
  badge_embedded: { badgeType: string; hostDomain: string };
  badge_awarded: { userId: string; badgeSlug: string };

  // Agency / Team
  team_member_invited: { workspaceId: string; role: string };
  team_member_joined: { workspaceId: string; userId: string };
  agency_client_added: { workspaceId: string; clientWorkspaceId: string };
  report_exported: { format: "pdf" | "csv"; scope: string };

  // Admin
  moderation_decided: { itemType: "review" | "comment" | "product"; decision: string };
  badge_issued: { type: string; targetUserId: string };
  user_suspended: { userId: string; reason: string };

  // Generic
  search_performed: { query: string; resultsCount: number };
  cta_clicked: { location: string; cta: string };
}

export type EventName = keyof EventMap;
