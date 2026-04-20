# LaunchMint - API Reference

**Base URL:** `https://launchmint.com/api/v1`
**Auth:** Bearer JWT in `Authorization` header (or HTTP-only cookie for browser).
**Format:** JSON request + JSON response.
**Versioning:** `/api/v1`. Breaking changes go to `/api/v2`.
**Rate limits:** 60 rpm anonymous, 600 rpm authenticated, 6000 rpm Pro+.

---

## Conventions

### Standard response envelope

```json
{
  "data": { ... },
  "error": null,
  "meta": { "requestId": "req_abc", "page": { "next": "cursor_xyz" } }
}
```

### Error envelope

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Body must include 'name'",
    "fields": { "name": "required" }
  },
  "meta": { "requestId": "req_abc" }
}
```

### Standard error codes
- `UNAUTHORIZED` - no/invalid auth
- `FORBIDDEN` - auth ok, no permission
- `NOT_FOUND` - resource missing
- `VALIDATION_FAILED` - body invalid
- `RATE_LIMITED` - too many requests
- `QUOTA_EXCEEDED` - plan usage cap hit
- `INTEGRATION_ERROR` - upstream (Stripe, Gemini, DataForSEO) failed
- `INTERNAL_ERROR` - server bug; logged to Sentry with `requestId`

### Pagination

Cursor-based.

```
GET /api/v1/reviews?productId=prd_x&limit=20&cursor=eyJpZCI6...
```

Response includes `meta.page.next` (null if no more) and `meta.page.prev`.

### Idempotency

For all `POST` mutations, accept optional `Idempotency-Key` header. Same key + same body within 24h returns the same response without re-executing.

### Workspace scoping

All authenticated requests assume the user's **active workspace** (from session). Switch via:
```
PATCH /api/v1/me  { "activeWorkspaceId": "ws_x" }
```
Or pass `X-Workspace-Id` header to override per-request.

---

## Endpoints

### Auth

```
POST   /api/v1/auth/google                   Google OAuth callback (NextAuth handles)
POST   /api/v1/auth/signout
GET    /api/v1/me                            Current user + workspaces
PATCH  /api/v1/me                            Update name, avatar, active workspace
DELETE /api/v1/me                            Delete account (soft, 30-day grace)
```

### Workspace

```
GET    /api/v1/workspaces                    List user's workspaces
POST   /api/v1/workspaces                    Create workspace
GET    /api/v1/workspaces/:id
PATCH  /api/v1/workspaces/:id
DELETE /api/v1/workspaces/:id
POST   /api/v1/workspaces/:id/members        Invite member
DELETE /api/v1/workspaces/:id/members/:uid   Remove member
PATCH  /api/v1/workspaces/:id/members/:uid   Change role
```

### Products

```
GET    /api/v1/products                      List my products
POST   /api/v1/products                      Create product (returns id + slug)
GET    /api/v1/products/:id                  Full detail (auth) - or use slug for public
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id                  Soft delete
POST   /api/v1/products/:id/publish          Move from DRAFT → SCHEDULED/LIVE
POST   /api/v1/products/:id/scrape           Pass URL, AI prefills product fields
POST   /api/v1/products/:id/screenshots      Upload screenshot (multipart)
DELETE /api/v1/products/:id/screenshots/:sid

# Public (no auth)
GET    /api/v1/public/products/:slug
GET    /api/v1/public/products/:slug/reviews
```

### Launches

```
POST   /api/v1/launches                      Schedule launch { productId, scheduledAt, timezone }
GET    /api/v1/launches/today                Today's leaderboard (public)
GET    /api/v1/launches/date/:yyyymmdd       Historical leaderboard (public)
POST   /api/v1/launches/:id/upvote
DELETE /api/v1/launches/:id/upvote
POST   /api/v1/launches/:id/comments         Post comment { body, parentId? }
GET    /api/v1/launches/:id/comments         Threaded list
DELETE /api/v1/launches/:id/comments/:cid
```

### Founders

```
GET    /api/v1/founders/:slug                Public founder profile
PATCH  /api/v1/founders/me                   Update own profile
POST   /api/v1/founders/me/publish           Toggle public visibility
GET    /api/v1/founders                      Search/filter founders (public)
                                              ?country= &category= &mrrMin= &sort=
```

### Reviews

```
POST   /api/v1/reviews/invite                Body: { productId, emails: [], message? }
                                              Sends magic-link invites via Resend.

POST   /api/v1/reviews                       Submit a review (token gated for invitee)
                                              Body: { token, rating, title, body }
GET    /api/v1/reviews?productId=
PATCH  /api/v1/reviews/:id                   Edit own review (within 24h)
DELETE /api/v1/reviews/:id                   Delete own review
POST   /api/v1/reviews/:id/reply             Founder reply
POST   /api/v1/reviews/:id/flag              Public flag
```

### Directories

```
GET    /api/v1/directories                   List + filter
                                              ?category= &drMin= &cost=free &sort=dr
GET    /api/v1/directories/:slug             Single directory
GET    /api/v1/directories/recommendations   AI-prioritized for the active product
                                              ?productId=
POST   /api/v1/directories/submit            { productId, directoryIds: [...] }
                                              → enqueues submission jobs
GET    /api/v1/directories/submissions       My submissions
                                              ?productId= &status=
PATCH  /api/v1/directories/submissions/:id   Update status manually
```

### SEO

```
POST   /api/v1/seo/domains                   Track a domain { domain, productId }
DELETE /api/v1/seo/domains/:id
GET    /api/v1/seo/snapshots                 ?productId= &range=30d
GET    /api/v1/seo/backlinks                 ?productId= &state=live|lost &cursor=
GET    /api/v1/seo/keywords                  ?productId= &country=
POST   /api/v1/seo/keywords/track            Add keywords to track
DELETE /api/v1/seo/keywords/:id
GET    /api/v1/seo/competitor                ?productId= &competitorDomain=  (V1)
POST   /api/v1/seo/refresh                   Manual trigger (rate-limited)
```

### MRR / Stripe

```
POST   /api/v1/integrations/stripe/connect   Returns Stripe OAuth URL
GET    /api/v1/integrations/stripe/callback  OAuth callback handler
DELETE /api/v1/integrations/stripe           Disconnect
GET    /api/v1/integrations/stripe/mrr       Current verified MRR for product
POST   /api/v1/integrations/stripe/refresh   Manual sync
```

### AI

Single unified endpoint to centralize cost + quota.

```
POST   /api/v1/ai/generate
       {
         "type": "product_description" | "meta_title" | "meta_description"
               | "social_post_x" | "social_post_linkedin" | "launch_post"
               | "cold_email" | "review_reply" | "competitor_summary"
               | "founder_summary" | "launch_readiness" | "keyword_suggestions"
               | "directory_description" | "seo_suggestions",
         "context": { ... },              // type-specific shape
         "model": "auto" | "pro" | "flash"
       }
       → { output, creditsCharged, model, generationId }

GET    /api/v1/ai/usage                      Workspace credit usage this period
GET    /api/v1/ai/history                    Recent generations
```

### Search

```
GET    /api/v1/search?q=&type=product|founder|directory&limit=20
```

### Notifications (V1)

```
GET    /api/v1/notifications                 List
PATCH  /api/v1/notifications/:id/read
POST   /api/v1/notifications/read-all
```

### Billing (Razorpay)

```
POST   /api/v1/billing/checkout              { plan, interval } → Razorpay link
POST   /api/v1/billing/portal                → Razorpay customer portal URL
POST   /api/v1/billing/cancel                Cancel at period end
POST   /api/v1/billing/webhook               Razorpay → us (HMAC verified)
GET    /api/v1/billing/subscription          Current subscription
GET    /api/v1/billing/invoices              History
```

### Reports / Export (V1)

```
POST   /api/v1/reports/generate              { type, productId, format } → job id
GET    /api/v1/reports/:jobId                Status + download URL
```

### Referrals (V1)

```
GET    /api/v1/referrals/me                  My code + stats
GET    /api/v1/referrals                     My referrals + status
POST   /api/v1/referrals/link                Generate trackable link
```

### Affiliates (V1)

```
POST   /api/v1/affiliates/apply
GET    /api/v1/affiliates/me                 Earnings + payouts
POST   /api/v1/affiliates/payout             Request payout
```

### Public read-only (V1+)

```
GET    /api/v1/public/today                  Today's leaderboard (cached 60s)
GET    /api/v1/public/comparisons/:a-vs-:b   Comparison page data
GET    /api/v1/public/best/:category         Best-of list data
```

### Admin (SuperAdmin / Moderator)

```
GET    /api/v1/admin/moderation/queue        ?type=review|comment|product
POST   /api/v1/admin/moderation/:id/decide   { decision: "approve"|"remove", reason }
GET    /api/v1/admin/users
PATCH  /api/v1/admin/users/:id               Suspend, role flags
POST   /api/v1/admin/badges                  Issue badge
GET    /api/v1/admin/audit                   Audit log search
POST   /api/v1/admin/directories             Add/edit directory
POST   /api/v1/admin/directories/:id/scrape  Trigger re-crawl
GET    /api/v1/admin/metrics                 KPI dashboard data
```

### Webhooks (incoming)

```
POST   /api/v1/webhooks/razorpay             Razorpay events (subscribed, charged, ...)
POST   /api/v1/webhooks/stripe               Stripe events (for MRR sync)
POST   /api/v1/webhooks/resend               Resend events (delivered, bounced, opened)
```

All webhooks HMAC-verified before processing. Failed webhooks retry via BullMQ with exponential backoff (max 24h).

### Internal (cron-secret protected, not public)

```
POST   /api/v1/internal/cron/seo-daily       header: x-cron-secret
POST   /api/v1/internal/cron/keyword-weekly
POST   /api/v1/internal/cron/mrr-daily
POST   /api/v1/internal/cron/digest-weekly   weekly SEO digest emails
POST   /api/v1/internal/cron/directory-recheck
```

---

## Sample request/response

### Create product

```http
POST /api/v1/products
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "name": "FormPilot",
  "tagline": "AI-powered form builder for SaaS",
  "websiteUrl": "https://formpilot.io",
  "category": "form-builder"
}
```

```json
{
  "data": {
    "id": "prd_2k4j5h",
    "slug": "formpilot",
    "name": "FormPilot",
    "tagline": "AI-powered form builder for SaaS",
    "status": "DRAFT",
    "launchScore": 0,
    "createdAt": "2026-04-17T10:23:11Z"
  },
  "error": null,
  "meta": { "requestId": "req_xyz" }
}
```

### AI: generate product description

```http
POST /api/v1/ai/generate
Authorization: Bearer eyJ...
Idempotency-Key: ai_prod_desc_prd_2k4j5h_v1

{
  "type": "product_description",
  "context": {
    "productId": "prd_2k4j5h",
    "tone": "founder-first",
    "wordCount": 250
  },
  "model": "auto"
}
```

```json
{
  "data": {
    "output": "FormPilot is an AI-native form builder...",
    "creditsCharged": 1,
    "model": "gemini-1.5-flash",
    "generationId": "gen_98as7d"
  }
}
```

### Submit review (token-gated, public)

```http
POST /api/v1/reviews
Content-Type: application/json

{
  "token": "rvw_invite_xyz...",
  "rating": 5,
  "title": "Saved me hours",
  "body": "We replaced Typeform and never looked back."
}
```

```json
{
  "data": {
    "id": "rvw_3j2k4",
    "status": "PENDING",
    "fakeScore": 0.04,
    "isVerified": true
  }
}
```

---

## API security

- TLS-only (HSTS, 1 year).
- HMAC verification on all incoming webhooks.
- Rotating JWT (15 min access token, 30 day refresh).
- CORS: `*` only on public endpoints; auth endpoints restricted to allowed origins.
- CSRF: SameSite=Lax cookies; double-submit cookie for state-changing requests from browser.
- SQL injection: Prisma parameterized queries only; no raw SQL except in audited migration files.
- XSS: All user content rendered via DOMPurify on client; markdown via `marked` with strict mode.
- Audit log on every admin mutation.

---

## Error budget & SLA targets

- **API availability:** 99.9% (43 min/month allowance)
- **API p95 latency:** < 400 ms (excluding AI endpoints)
- **AI endpoint p95:** < 6 s
- **Webhook delivery:** retried for 24h before deadletter

Tracked via Sentry (errors), PostHog (analytics), Better Stack (uptime).
