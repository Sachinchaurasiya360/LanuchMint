/**
 * Typed registry of all queue jobs. Add a new job by extending JobMap and
 * QUEUE_NAMES — producers and workers stay in sync via the type system.
 */

export interface JobMap {
  "send-welcome-email": { userId: string; email: string; firstName: string };
  "send-magic-link": { email: string; url: string; expiresInMinutes: number };
  "send-payment-receipt": {
    userId: string;
    invoiceId: string;
    plan: string;
    amount: string;
    currency: string;
    invoiceUrl: string;
    periodStart: string;
    periodEnd: string;
  };
  "send-launch-reminder": {
    launchId: string;
    daysOut: 3 | 1;
  };
  "send-launch-live": { launchId: string };
  "send-review-invite": {
    productId: string;
    workspaceId: string;
    email: string;
    token: string;
    personalNote?: string;
  };
  "ai-generate-product-meta": {
    productId: string;
    workspaceId: string;
    fields: ("description" | "metaTitle" | "metaDescription")[];
  };
  "ai-launch-readiness": {
    productId: string;
    workspaceId: string;
  };
  "ai-classify-review": {
    reviewId: string;
    workspaceId: string;
  };
  "ai-recommend-directories": {
    productId: string;
    workspaceId: string;
  };
  "submit-directory": {
    submissionId: string;
  };
  "verify-directory-backlink": {
    submissionId: string;
  };
  "directory-verify-tick": Record<string, never>;
  "seo-snapshot-domain": { trackedDomainId: string; workspaceId: string };
  "index-product": { productId: string };
  "reindex-search": { kind: "products" | "founders" | "directories" };
  "moderation-scan": { entityType: "product" | "review" | "comment"; entityId: string };
  "launch-tick": Record<string, never>;
}

export type JobName = keyof JobMap;

export const QUEUE_NAMES = {
  email: "email",
  ai: "ai",
  seo: "seo",
  search: "search",
  moderation: "moderation",
  launch: "launch",
  directory: "directory",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const JOB_TO_QUEUE: Record<JobName, QueueName> = {
  "send-welcome-email": "email",
  "send-magic-link": "email",
  "send-payment-receipt": "email",
  "send-launch-reminder": "email",
  "send-launch-live": "email",
  "send-review-invite": "email",
  "ai-generate-product-meta": "ai",
  "ai-launch-readiness": "ai",
  "ai-classify-review": "ai",
  "ai-recommend-directories": "ai",
  "submit-directory": "directory",
  "verify-directory-backlink": "directory",
  "directory-verify-tick": "directory",
  "seo-snapshot-domain": "seo",
  "index-product": "search",
  "reindex-search": "search",
  "moderation-scan": "moderation",
  "launch-tick": "launch",
};
