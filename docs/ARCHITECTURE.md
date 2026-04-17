# LaunchMint — Technical Architecture

This document describes how LaunchMint is built, deployed, and scaled. Audience: engineers and SREs.

---

## Architecture principles

1. **DRY first.** All cross-app concerns live in `packages/*`. Build the shared layer in Sprint 1 before any feature.
2. **Boring tech.** Postgres + Node + Redis. No Kubernetes at MVP. No microservices unless forced.
3. **SEO is a first-class system requirement.** Every public page must SSR/ISR with structured data and sub-2s LCP.
4. **Cost-aware.** Every external API (Gemini, DataForSEO, Stripe) is wrapped, cached, queued, and quota'd.
5. **Multi-tenant via row scoping.** Single DB. `workspaceId` on every tenant row. App-level enforcement.
6. **Async by default.** Anything that calls a third party or takes >300ms goes through BullMQ.
7. **Idempotent everywhere.** Re-running a job/webhook/migration must not double-charge or duplicate data.

---

## System diagram

```
                          ┌──────────────────────┐
                          │     Cloudflare       │
                          │  CDN + DDoS + DNS    │
                          └──────────┬───────────┘
                                     │
                       ┌─────────────▼─────────────┐
                       │   Next.js 14 (Vercel)     │
                       │  • Public SSR/ISR pages   │
                       │  • Dashboard (auth)       │
                       │  • API routes /api/v1/*   │
                       └────┬───────────────┬──────┘
                            │               │
        ┌───────────────────┘               └────────────────────┐
        │                                                          │
   ┌────▼─────────┐    ┌──────────────┐    ┌──────────────┐  ┌────▼──────┐
   │ PostgreSQL   │    │    Redis     │    │  Typesense   │  │ AWS S3 +  │
   │ (RDS, M-AZ)  │    │ (ElastiCache)│    │   (Docker)   │  │CloudFront │
   └──────────────┘    └──────┬───────┘    └──────────────┘  └───────────┘
                              │
                       ┌──────▼───────┐
                       │ Worker (EC2) │
                       │  Docker      │
                       │  BullMQ      │
                       └──────┬───────┘
                              │
   ┌──────────────────────────┼─────────────────────────────────────┐
   │                          │                                       │
   │  External integrations (all via packages/* wrappers)             │
   │                                                                   │
   │   Gemini  ▪  DataForSEO  ▪  Resend  ▪  Razorpay  ▪  Stripe(R)   │
   │   PostHog ▪  Sentry      ▪  Google OAuth  ▪  IndexNow            │
   └───────────────────────────────────────────────────────────────────┘
```

---

## Component breakdown

### `apps/web` — Next.js 14

- **Public site** (`app/(public)/*`): `/`, `/today`, `/products/[slug]`, `/founders/[slug]`, `/categories/[slug]`, `/directories`, `/best/[cat]`, `/compare/[a]-vs-[b]`, marketing pages.
  - Rendering: ISR with `revalidate: 60` for high-change pages, `revalidate: 3600` for evergreen (founder profile, comparison).
  - All pages emit JSON-LD via `packages/seo-meta`.
- **Dashboard** (`app/(app)/*`): `/app/*` SSR with auth-required middleware.
- **API routes** (`app/api/v1/*`): Mounted under Next; thin handlers that call into shared service modules in `packages/*`.
- **Auth middleware**: `middleware.ts` enforces `requireAuth` on `/app/*` and `/api/v1/*` (except `/api/v1/public/*` and `/api/v1/auth/*`).

### `apps/worker` — standalone Node

- One process, one Docker container.
- Spawns one BullMQ Worker per queue (concurrency configurable per queue).
- Reads same `packages/*` modules.
- Handles cron via `bullmq-pro`-style repeat options or system cron POST-ing internal endpoints.

### `packages/*` — shared

| Package | Responsibility |
|---------|---------------|
| `ui` | Shadcn-based component library, brand-locked tokens |
| `db` | Prisma client + workspace-scoped helpers (`scoped.product.findMany(...)`) |
| `auth` | NextAuth config, RBAC `can()` and `requirePermission()` |
| `ai` | Gemini wrapper: `generate({ type, context, model })`, prompts versioned, cost-tracked |
| `email` | Resend wrapper + React Email templates |
| `queue` | BullMQ producers + typed job definitions |
| `seo-meta` | `buildJsonLd(type, data)`, `buildMetaTags(page)` |
| `seo-data` | DataForSEO wrapper with caching layer |
| `storage` | S3 pre-signed URLs, image optimization helpers |
| `billing` | Razorpay (write) + Stripe Connect (read-only MRR) |
| `analytics` | PostHog client + event taxonomy |
| `search` | Typesense indexers + query helpers |
| `config` | Shared eslint, tsconfig, tailwind preset |

---

## Request lifecycle (dashboard mutation)

```
Browser (logged-in founder)
  → PATCH /api/v1/products/prd_x  { name: "..." }
  → Next.js middleware: verify JWT cookie
  → Handler in apps/web/app/api/v1/products/[id]/route.ts:
      1. parseBody() with Zod
      2. requirePermission("product.edit", { productId })
      3. db.product.update(...)
      4. queue.enqueue("typesense-reindex", { productId })
      5. queue.enqueue("ai-regenerate-meta", { productId }) if name changed
      6. analytics.capture("product_edited", { productId })
      7. return { data, meta }
  → Response 200
Worker (parallel):
  → typesense-reindex job → search.indexProduct(productId)
  → ai-regenerate-meta job → ai.generate({ type: "meta_title", ... }) → db.product.update
```

---

## Background job catalog (BullMQ)

| Queue | Concurrency | Schedule | Purpose |
|-------|:-----------:|----------|---------|
| `email` | 10 | on-demand | Resend dispatches |
| `typesense-reindex` | 5 | on-demand | Keep search current |
| `ai-generation` | 3 | on-demand | Gemini calls (rate-limited) |
| `seo-daily` | 2 | cron 02:00 UTC | DR + traffic snapshot all tracked domains |
| `seo-weekly` | 2 | cron Mon 03:00 UTC | Backlinks + keyword rank refresh |
| `mrr-daily` | 5 | cron 04:00 UTC | Stripe MRR pull per connected workspace |
| `directory-submit` | 5 | on-demand | Auto-submit to API-enabled directories |
| `directory-verify` | 3 | cron daily 05:00 UTC | Check pending submissions for live backlinks |
| `digest-weekly` | 5 | cron Mon 09:00 UTC (per founder TZ) | SEO + reviews weekly digest |
| `fake-review-scan` | 5 | on-demand (per review submit) | Gemini classifier |
| `webhook-process` | 10 | on-demand | Razorpay/Stripe/Resend webhooks |
| `scrape-meta` | 3 | on-demand | Onboarding URL scrape |
| `scrape-directory-db` | 1 | manual (admin) | Refresh directory database |
| `referral-payout` | 1 | cron 1st of month | Reward payouts |

**Job design rules:**
- Every job idempotent: re-running with same input must not double-write.
- Every job carries `correlationId` for log tracing.
- Default retry: exponential backoff, max 5 attempts, dead-letter queue after.
- Long-running jobs (> 30s) chunk and re-enqueue subtasks.

---

## Caching strategy

| Layer | TTL | What |
|-------|-----|------|
| Cloudflare edge | 60s–24h | Public HTML pages |
| ISR | 60s (dynamic), 1h (evergreen), 24h (programmatic) | Next.js cached HTML |
| Redis hot cache | 30–600s | `today's leaderboard`, `top categories`, `founder profile basics` |
| App memory | n/a | None (avoid stale across instances) |
| DataForSEO cache | 24h DR, 7d backlinks, 7d keyword positions | Reduce upstream cost |
| Gemini cache | None at MVP | Generations are always fresh per founder; consider semantic cache in V1 |

Cache invalidation:
- On product update → invalidate ISR for `/products/[slug]`, `/categories/[cat]`, `/today` (if scheduled today).
- Use `revalidatePath()` from server actions.

---

## Multi-tenancy

- **Single DB, single schema, row-level scoping.** Every tenant table has `workspaceId`.
- `packages/db` exports `dbScoped(workspaceId)` returning a Prisma client proxy that auto-injects `workspaceId` filter on every query — eliminates "forgot to filter" bugs.
- Cross-tenant queries (admin, search index build) use raw `db` and explicit comments.
- **Why not RLS?** App-level filter is faster, easier to debug, and avoids per-connection role overhead. Trade-off: a single missed filter is a leak — mitigated by the proxy + lint rule that warns on raw `db.<table>` usage in app code.

---

## AI infrastructure (Gemini)

```
Caller in apps/web → packages/ai.generate({ type, context, model? })
  → check workspace daily cost cap
  → check usage credits
  → load prompt template from packages/ai/prompts/<type>.ts
  → render with context (Mustache-style)
  → submit to Gemini (Pro vs Flash via `model: auto` heuristic)
  → on success:
      - persist AiGeneration row (prompt, response, tokens, cost, latency)
      - increment UsageCounter.aiCreditsUsed
      - return { output, creditsCharged, generationId }
  → on safety block / error:
      - persist AiGeneration with status
      - return error
```

**Cost guard:** Per-workspace daily cap (Free: $0.10, Starter: $1, Growth: $4, Pro: $20, Agency: $50). Soft warn at 80%, hard block at 100%.

**Prompt versioning:** Each prompt file exports `version: "v3"`. AiGeneration row stores version. A/B testing via PostHog feature flag selects version per user.

**Quality monitoring:** Sample 1% of generations to a human-review queue; thumbs-up/down feedback writes back to prompt iteration backlog.

---

## SEO infrastructure

**Sitemap:**
- Generated dynamically at `/sitemap.xml` (index file).
- Split: `/sitemaps/products.xml`, `/sitemaps/founders.xml`, `/sitemaps/directories.xml`, `/sitemaps/comparisons.xml`, `/sitemaps/categories.xml`.
- Each sitemap paginated at 50k URLs.
- Last-mod = `updatedAt`.

**Indexing:**
- IndexNow ping on every publish/update via `packages/seo-meta/indexnow`.
- GSC sitemap submission once at launch (manual).

**JSON-LD:**
- `packages/seo-meta/jsonld` exports a `buildJsonLd(type, payload)` helper.
- Types covered: `Product`, `Person`, `Organization`, `SoftwareApplication`, `Review`, `AggregateRating`, `BreadcrumbList`, `FAQPage`, `WebSite` (sitelinks search box).
- All public page templates inject the appropriate type(s).

**Performance budget:**
- LCP ≤ 2.0s on slow 4G
- INP ≤ 200ms
- CLS ≤ 0.1
- Total page weight ≤ 250 KB compressed (excluding hero image)
- No client-side hydration for fully static content (use Server Components)

---

## Search infrastructure (Typesense)

**Indexes:**

```
products  (id, slug, name, tagline, description, category, industry,
           launchedAt, trustScore, upvoteCount, mrrCents)
founders  (id, slug, displayName, headline, country, productCount, totalMrrCents)
directories (id, slug, name, description, category, domainRating, cost)
comparisons (id, slugA, slugB, productAName, productBName)
```

- Worker rebuilds full index on schema change (rare).
- On every CRUD, app pushes update to `typesense-reindex` queue.
- Search query latency target < 100ms p95.

---

## Webhooks

**Outgoing (V1):**
- Per-workspace webhooks for: `review.received`, `backlink.gained`, `backlink.lost`, `launch.live`, `subscription.updated`. HMAC-signed.

**Incoming:**
- `/api/v1/webhooks/razorpay` — subscription events
- `/api/v1/webhooks/stripe` — for Stripe Connect MRR side
- `/api/v1/webhooks/resend` — delivery, bounce, open, click

All incoming webhooks:
1. Verify HMAC.
2. Persist raw event to `WebhookEvent` table (idempotency by event id).
3. Enqueue `webhook-process` job.
4. Return 200 immediately.

---

## Auth & session

- **Provider:** Google OAuth via NextAuth.js.
- **Session strategy:** JWT in HTTP-only, Secure, SameSite=Lax cookie. 15-min access token, 30-day refresh.
- **CSRF:** Double-submit cookie pattern for state-changing browser requests.
- **API auth:** Same JWT in `Authorization: Bearer` for non-browser clients. (V1: API keys.)
- **Account deletion:** Soft delete + 30-day grace; user can recover by signing in. After 30 days, hard delete (PII purged, content kept anonymized).

---

## Observability

| Tool | Purpose |
|------|---------|
| Sentry | Errors (web + worker), source-mapped, with `requestId` |
| PostHog | Product analytics + feature flags + session replay (10% sample) |
| Better Stack | Uptime + status page |
| Postgres slow query log | Queries > 200ms surface to Sentry |
| BullMQ Dashboard | Queue health (private subnet, basic auth) |
| Custom metrics endpoint | `/api/v1/internal/metrics` (Prometheus exposition) — V1 |

**Logs:**
- Structured JSON via `pino`. `correlationId` carried from HTTP request → enqueued job → child jobs.
- Log retention: 14 days hot in Better Stack, archive to S3 for 90 days.

**Alerts (PagerDuty or email-only at MVP):**
- p95 API latency > 1s for 10 min
- Error rate > 1% for 5 min
- Worker queue depth > 1000 for 15 min
- DB CPU > 80% for 10 min
- Razorpay webhook failure rate > 5% for 5 min

---

## Deployment

**MVP infra (single region, us-east-1):**
- Web: Vercel (Pro plan to allow background revalidation + ISR scale).
- Worker: 1× t3.large EC2, Docker Compose (`worker`, `typesense`, `redis-replica?`).
- DB: RDS Postgres 16, db.t3.medium, multi-AZ, daily snapshot, 7-day PITR.
- Cache: ElastiCache Redis 7, cache.t4g.small.
- Storage: S3 + CloudFront (1 bucket: `launchmint-uploads`).
- DNS + edge: Cloudflare.

**CI/CD (GitHub Actions):**

```yaml
# Simplified outline
on: [push to main]
jobs:
  test:
    - pnpm install
    - pnpm lint
    - pnpm typecheck
    - pnpm test
  build:
    - pnpm build (turbo)
  deploy-web:
    - vercel deploy --prod
  deploy-worker:
    - docker build -t worker:$SHA
    - docker push to ECR
    - ssh ec2 "docker compose pull && docker compose up -d"
  migrate:
    - ssh ec2 "pnpm db:migrate" (only if migrations folder changed)
  notify:
    - resend email to ops@
```

**Promotion gates:**
- All checks green.
- Migrations marked safe (`prisma migrate diff` produces only additive changes) auto-deploy.
- Destructive migrations require manual approval.

**Rollback:**
- Web: redeploy previous Vercel deployment (1 click).
- Worker: `docker compose up -d --no-deps worker:<previous-sha>`.
- DB: PITR restore for catastrophic only; otherwise feature-flag the broken code path.

---

## Scaling plan

| Stage | Users | Bottleneck | Action |
|-------|------:|-----------|--------|
| 0–1k MAU | — | None | Single t3.large worker, db.t3.medium |
| 1k–10k MAU | DB writes (review submits) | Add RDS read replica; route read queries via Prisma read replicas |
| 10k–50k MAU | Worker queue depth | Add second worker EC2; partition queues |
| 50k–200k MAU | Edge cache miss rate | Add Vercel ISR scaling; add second region; consider managed K8s |
| 200k+ MAU | DB partitioning | Shard by `workspaceId` range or move to Aurora |

**Cost ceiling targets:**
- Until 1k paid users: < $1k/mo total infra
- Until 10k paid users: < $5k/mo
- Beyond: cost per paid user < $1/mo

---

## Security

- **Encryption at rest:** RDS encrypted, S3 SSE-KMS, ElastiCache encrypted, RDS snapshots encrypted.
- **Encryption in transit:** TLS 1.3 everywhere; HSTS preload.
- **Secrets:** AWS Secrets Manager, not env files in repo. Local dev uses `.env` (gitignored).
- **Integration tokens:** OAuth refresh tokens encrypted column-level with AWS KMS data key.
- **Backups:** RDS daily snapshot 7-day PITR; S3 versioning enabled.
- **DR:** Documented runbook for region failover (V2 — at MVP, accept ~RTO 4h with snapshot restore).
- **Vulnerability scanning:** Dependabot + GitHub CodeQL on PRs.
- **Pen test:** External pen test booked at $20k MRR threshold.
- **GDPR:** EU users can request export + delete via `/app/settings/privacy`. Export job dumps user-owned rows + signed URL emailed via Resend.
- **DPA:** Standard DPA available for Pro+/Agency customers.

---

## Anti-abuse

- **Sign-up rate limit:** 3 accounts per IP / 24h.
- **Comment / review rate limit:** 1 / 30s per user, 10 / hour per user.
- **Upvote brigading:** Upvotes weighted by account age + verification + IP cluster detection. Suspicious clusters flagged to moderation queue.
- **Fake review:** Gemini classifier (text patterns, account age, time-since-signup, IP, language consistency). Score > 0.7 auto-quarantined.
- **Scraper protection:** Cloudflare bot challenge for high-volume IPs; aggressive robot.txt + RateLimit-Reset headers.
- **AI prompt injection:** Input length cap (8k tokens), suspicious-pattern filter (`ignore all previous instructions`, etc.), separate system prompt that's never user-controlled.

---

## Test strategy

| Layer | Tool | Coverage |
|-------|------|----------|
| Unit | Vitest | All `packages/*` exports — target 80% |
| Integration | Vitest + Testcontainers | API routes against real Postgres + Redis |
| E2E | Playwright | Top user flows: signup → product create → publish → review |
| Visual regression | Playwright + Percy | Public page templates |
| Load | k6 | Pre-launch: 1000 RPS on `/today` and `/products/[slug]` |
| AI eval | Custom harness | Per-prompt regression suite (10 examples per prompt) |

**Pre-deploy gates:** lint + typecheck + unit + integration must pass. E2E runs nightly, blocks deploys only on smoke-test subset.

---

## Documentation owned by engineers

- This file (`ARCHITECTURE.md`)
- [DATABASE.md](./DATABASE.md)
- [API.md](./API.md)
- Per-package `README.md` inside `packages/*/README.md`
- Inline JSDoc on every exported function in `packages/*`
- Runbook directory `docs/runbooks/` (V1+) — incident response, on-call, deploy rollback
