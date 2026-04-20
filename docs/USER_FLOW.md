# LaunchMint - User Flow & Feature Reference

This document describes **what a user actually does in LaunchMint today**, screen by screen, with the exact features that exist in the codebase as of Sprint 8. It's written for founders, designers, QA, and new engineers who need to know what the product *is* - not what it aspires to be.

No marketing language. If a feature is listed here, the code exists under `apps/web/src/app/...` or `packages/...`. Items still on the roadmap are called out explicitly in the "Not yet" notes at the bottom of each section.

---

## 0. Personas

| Persona | Primary job to be done |
|---|---|
| **Founder** | Launch a product, collect reviews, rank in search, track MRR. |
| **Reviewer** | Submit a verified review via emailed invite link. |
| **Visitor / buyer** | Browse products, compare two, read reviews, upvote, comment. |
| **Admin / moderator** | Decide on flagged reviews/comments/products, read audit log. |

The flow below walks through the Founder path end-to-end, then covers the three other personas at the end.

---

## 1. Landing → Sign up (2 minutes)

**Where:** `/` → `/signin` → `/app/onboarding`

1. Visitor lands on `/`. The landing page is server-rendered, ships `Organization` + `WebSite` JSON-LD, and has a top nav (`/today`, `/directories`, `/pricing`, `/changelog`). Skip-to-content link is present for keyboard users.
2. Clicks **Sign in** → `/signin`. Two auth methods: Google OAuth and email magic link (NextAuth v5). Redirects to `/app` on success.
3. First-time user is auto-routed to `/app/onboarding` - a 6-step flow (`onboarding-flow.tsx`) with a visible progress bar and **smart resume**: if the user already has a founder profile, they jump to step 3; if they already have a product, they jump to step 5.

**PostHog events fired:** `user_signed_up`, `user_signed_in`, `workspace_created`, `user_completed_onboarding`.

**Emails sent:** `WelcomeEmail` (immediate), then `OnboardingNudgeEmail` if the user drops off mid-flow for > 24 h.

---

## 2. Founder profile setup

**Where:** `/app/profile` (public page at `/founders/[slug]`)

What a founder fills in: first name, last name, headline, bio, location, avatar (S3 pre-signed upload), social links (Twitter/X, LinkedIn, website). A slug is auto-generated via `ensureUniqueSlug`.

The public `/founders/[slug]` page renders with `Person` + `BreadcrumbList` JSON-LD and cross-links every product this founder owns in any workspace they're a member of.

---

## 3. Create a product (the core flow)

**Where:** `/app/products/new` → `/app/products/[id]/edit`

Step-by-step:

1. **Paste URL.** `scrapeUrlAction` runs a Cheerio-based scraper (`packages/scrape`) against the marketing site and returns `{title, description, ogImage, favicon}`. Fills the form.
2. **Name + tagline + category + industry.** Category is a fixed list from `apps/web/src/lib/categories.ts` (Productivity, Developer Tools, Marketing, Sales, Analytics, Design, AI, SaaS, Other).
3. **Submit.** `createProductAction` creates a `DRAFT` row, enqueues `index-product`, tracks `product_created`, redirects to the edit screen.
4. **On the edit screen** the founder can:
   - Click **AI prefill** - `aiPrefillAction` calls three Gemini prompts (`product_description`, `meta_title`, `meta_description`), writes the result back to the product, and shows it for editing.
   - Upload a logo + OG image via S3 pre-signed URL (`/api/v1/uploads/sign`, content-type allowlist, per-workspace key namespace).
   - Set `pricingModel`, `seoKeywords`, `metaTitle`, `metaDescription`.
   - Flip `status: DRAFT → LIVE`. This stamps `publishedAt`, pings IndexNow for `/products/[slug]`, `/categories/[slug]`, `/best/[slug]`, and tracks `product_published`.

The public page goes live at `/products/[slug]` with `SoftwareApplication` + `BreadcrumbList` JSON-LD, ISR-revalidates every 300 s, and emits AggregateRating + up-to-20 Review JSON-LD nodes as soon as reviews exist.

---

## 4. Schedule and run a launch

**Where:** `/app/launches` → public `/today` → historical `/launches/[date]`

1. Founder opens the launches dashboard. The product's **AI launch readiness score** (`generateLaunchReadiness`, Gemini Pro) is shown as `{score 0–100, summary, blockers[], suggestions[]}`. A **Re-score** button re-runs the prompt.
2. Founder picks a UTC date and calls `scheduleLaunchAction`. A `Launch` row is created in `SCHEDULED`.
3. A BullMQ repeatable `launch-tick` (per-minute) does three things:
   - At `now >= launchAt`, flips the launch to `LIVE` and fires `LaunchLiveEmail`.
   - D-3 and D-1 before launch, sends `LaunchReminderEmail` (dedup-stamped on `launch.metadata.remindersSent`).
   - At UTC day-end, flips all `LIVE` launches that day to `ENDED` and assigns ranks 1..N by `upvoteCount`.
4. The public `/today` page (ISR 60 s) renders the day's leaderboard with upvote + comment counts.
5. Historical days are browsable at `/launches/[date]` with prev/next nav. Future dates return `notFound()` so they aren't indexed.

**What visitors can do on a launch:** upvote (1 per user, enforced by `@@unique([productId, userId])`) and post threaded comments (2-level replies, `postCommentAction`, author soft-delete supported).

**PostHog events:** `launch_scheduled`, `launch_went_live`, `launch_ended`, `upvote_cast`, `upvote_removed`, `comment_posted`.

---

## 5. Invite reviewers → collect verified reviews

**Where:** `/app/products/[id]/reviews` (public surfacing on `/products/[slug]`)

1. Founder pastes emails (comma or newline separated) into the invite form. `inviteReviewersAction` dedupes, strips invalids, skips anyone who has already reviewed, then enqueues `send-review-invite` jobs. Cap per batch: 50. Per-workspace daily cap is gated via `UsageCounter`.
2. Each invitee gets `ReviewInviteEmail` with a link to `/review/[token]`. The token is **stateless HMAC-SHA256** (`signReviewInvite`, 21-day TTL, signed with `NEXTAUTH_SECRET` - no DB row). `verifyReviewInvite` re-runs the HMAC on arrival.
3. Reviewer lands on `/review/[token]`, their email is pre-filled, they pick a rating 1–5 and write ≥ 30 chars of body. Submit → `submitReviewAction`:
   - Rejects if a review for that `{productId, email}` already exists.
   - Creates a `Review` row with `isVerified = true`, `verificationMethod = "email-invite"`, `status = "PUBLISHED"`.
   - Enqueues `ai-classify-review` (Gemini Flash → `{fakeScore, reasons}`). If `fakeScore >= 0.7`, the handler flips the review to `FLAGGED`.
   - Fires `ReviewReceivedEmail` to the founder.
4. Founder opens the review inbox - three tabs: **Flagged**, **Pending**, **Published**. For each review they can:
   - Write a reply manually, or
   - Click **AI draft reply** → `suggestReplyAction` (Flash, founder-voice prompt) pre-fills the textarea.
   - Approve / remove flagged reviews.
5. Reviewer receives `ReviewRepliedEmail` when the founder responds.
6. Public product page shows: star rating, count, each review with a "Verified customer" badge when applicable, and the founder's reply inline.

**PostHog events:** `review_invite_sent`, `review_invite_clicked`, `review_submitted`, `review_replied`, `review_flagged`, `review_moderated`.

---

## 6. Submit to 200+ directories

**Where:** `/app/products/[id]/directories` (public directory pages at `/directories/[slug]`)

1. Founder clicks **Refresh recommendations**. `recommendDirectories` (Gemini Flash) takes the product + all 200+ seeded directories, scores them, and writes the top-25 as `DirectorySubmission` rows in `PENDING`.
2. For each recommendation the UI shows the directory, the AI-chosen score, and a short reason.
3. **If the directory has an API adapter (`hasApi = true`):** the `submit-directory` worker auto-marks it `SUBMITTED` using the directory's `apiNotes`.
4. **If form-only:** founder clicks **Generate submission copy** → `generateDirectoryDescription` writes a budget-tight tailored paragraph (length-constrained to each directory's limits). Copy-to-clipboard button + **Open in new tab**. Founder submits manually, returns, and clicks **Mark submitted** → `IN_PROGRESS`.
5. A daily `directory-verify-tick` (03:17 UTC) re-enqueues `verify-directory-backlink` for every open submission. The per-row job HEAD-fetches the directory URL and regex-matches the product host against the HTML. On hit: status promotes to `LIVE` and a `Backlink` row is upserted (which the SEO dashboard reads).
6. Founder gets `DirectorySubmissionLiveEmail` when a listing lands.

Public `/directories` + `/directories/[slug]` pages emit `CollectionPage` + `Service` + `BreadcrumbList` JSON-LD and show recently-listed products per directory.

---

## 7. SEO dashboard

**Where:** `/app/seo`

1. Founder adds a domain via `add-domain-form.tsx`. A `TrackedDomain` row is created and `seo-snapshot` is enqueued. The worker calls DataForSEO (Labs + Backlinks), caches results 24 h in Redis, and writes:
   - `SeoSnapshot` (DR, referring domains, organic traffic).
   - `KeywordRanking` rows per tracked keyword.
   - `Backlink` rows for gained/lost links.
2. The dashboard renders:
   - Four headline KPIs (Domain Rating, Organic Traffic, Keywords in top-10, Referring domains) with 30-day sparklines (`sparkline.tsx`, inline SVG).
   - Top tracked keywords with position + position-delta, powered by `keyword-controls.tsx` (add / remove / bulk-suggest via the `keyword_suggestions` prompt).
   - Backlinks table (most recent, filterable by type gained / lost).
   - AI suggestions panel (`seo_suggestions` prompt) with copy-ready action items.
3. Founder receives `WeeklySeoDigestEmail` every Monday 08:00 local (sent via `weekly-digest-tick`) summarising impressions/clicks/top query/top page.

---

## 8. Connect Stripe → verified MRR on the public page

**Where:** `/app/integrations/stripe` → public `/products/[slug]`

1. Founder clicks **Connect Stripe**. OAuth redirect handled at `/api/v1/stripe/connect/authorize` and `/api/v1/stripe/connect/callback` - the `Integration` row stores the Stripe account ID (read-only).
2. A daily `mrr-sync-tick` pulls the Stripe account's subscription MRR via the `Stripe-Account` header, writes a `MrrSnapshot` row, and keeps 90 days of history.
3. The public product page renders a `ShieldCheck`-badged "Verified MRR: $X,XXX / mo" whenever a fresh snapshot exists. The `/compare/*` pages use the same data for head-to-head.

---

## 9. Billing + plan gating

**Where:** `/pricing` (public), `/app/billing` (founder)

1. Founder opens `/pricing`. Plan matrix comes from `packages/billing/plans.ts`: Free / Starter / Pro / Agency, each with quotas for products, AI credits, tracked keywords, review invites, team seats.
2. Founder clicks a plan → Razorpay Subscription is created via `createSubscriptionAction`. Payment redirect flows through Razorpay's hosted page and back.
3. `/api/v1/razorpay/webhook` verifies the HMAC-SHA256 signature and handles `subscription.activated` / `subscription.charged` / `subscription.cancelled` / `subscription.payment.failed`, updating the local `Subscription` row.
4. `packages/billing/gating.ts` exposes `requireQuota()` / `enforce()` - called by product creation, AI prompt calls, review invite flow, SEO keyword adds. Hitting a cap surfaces a quota error with a CTA to `/app/billing`.
5. `/app/billing` shows: current plan, renewal date, invoices, a `usage-bar.tsx` for each quota. Cancel button flips the subscription to `CANCEL_AT_PERIOD_END` and triggers `SubscriptionCanceledEmail`.
6. `PaymentReceiptEmail` on successful charge. `PaymentFailedEmail` on a bank decline, with the bank-reported reason and the next retry date.

---

## 10. Public discovery surfaces (SEO surface area)

Every one of these is live, indexable, linked from the sitemap, and server-rendered with ISR:

| Route | What it is | JSON-LD | Refresh |
|---|---|---|---|
| `/` | Landing. | Organization + WebSite | build-time |
| `/today` | Today's launching products, ranked by upvotes. | - | ISR 60 s |
| `/launches/[date]` | Historical leaderboard (UTC day). | - | ISR 1 h |
| `/products/[slug]` | Product page - tagline, description, reviews, MRR widget, comments, upvote. | SoftwareApplication + Review + BreadcrumbList | ISR 300 s + IndexNow on publish |
| `/founders` | Founder directory - search + location filter. | - | ISR 1 h |
| `/founders/[slug]` | Public founder profile + all their products. | Person + BreadcrumbList | ISR 1 h |
| `/categories` | All categories. | CollectionPage | ISR 1 h |
| `/categories/[slug]` | Products in one category, sorted by `publishedAt`. | CollectionPage + BreadcrumbList | ISR 1 h |
| `/best/[category]` | Top 25 in that category, blended score. | CollectionPage + BreadcrumbList | ISR 1 h |
| `/compare/[a]-vs-[b]` | Head-to-head with rating, upvotes, verified MRR, pricing. Only renders if both have ≥ 120 chars description. | ItemList + BreadcrumbList | ISR 1 h |
| `/directories` + `/directories/[slug]` | Directory discovery for founders. | CollectionPage + Service | build-time |
| `/sitemap*.xml` | Sharded across 8 sitemap IDs (core/products/founders/launches/directories/categories/best/compare). Compare capped at top-6 per category. | - | per-request |
| `/robots.txt` | Disallows `/app` and `/api`. | - | static |
| `/api/v1/indexnow/key` | Returns the IndexNow verification key as `text/plain`. | - | - |

Every public page server-renders and is reachable without auth (whitelisted in `middleware.ts`). Loading skeletons (`loading.tsx`) exist for the six highest-traffic templates.

---

## 11. Search (`Cmd+K`)

A global `<GlobalSearch />` component is mounted site-wide. `Cmd/Ctrl+K` opens a palette that queries `/api/v1/search`, which fans out to Typesense across three collections - `products`, `founders`, `directories` - and returns ranked hits. Reindex workers keep those collections fresh on every mutation.

---

## 12. Admin / moderation

**Where:** `/app/admin/moderation`, `/app/admin/audit`

Gated by `can(ctx, "moderation.queue")` / `admin.audit`. Non-admins get `notFound()` - the routes don't acknowledge they exist.

- **Moderation queue** has three tabs:
  - **Reviews** - `FLAGGED` reviews with author, rating, fake score, reasons. Approve / Remove.
  - **Comments** - flagged comments with body preview. Approve / Remove.
  - **Products** - any product that has at least one flagged review or comment (aggregated via `groupBy`).
- Every decide action calls `recordAudit({actorId, action: "moderation.review.<decision>", target, metadata})`. `recordAudit` pulls IP + user-agent from `headers()` and writes an `AuditLog` row.
- `/app/admin/audit` filters the log by action prefix and actor ID.

**PostHog:** `moderation_decided`.

---

## 13. Account lifecycle

- **Team invite**: owner sends an invite (`inviteTeamMemberAction`) → `TeamInviteEmail` with a signed accept link. Invitee accepts → `WorkspaceMember` row is created with the role.
- **Account deletion**: founder requests deletion from `/app/settings`. User PII is scrubbed; workspace-owned products get unpublished or transferred per the request. `AccountDeletedEmail` is sent.

---

## 14. End-to-end "first week" as a founder

A realistic timeline for somebody who signs up today:

| Day | What happens |
|---|---|
| **Day 0, T+0 min** | Sign up with Google. Land on onboarding. |
| **Day 0, T+3 min** | Paste the product URL, Cheerio scraper fills the form, hit **AI prefill**, save as DRAFT. |
| **Day 0, T+5 min** | Upload logo + OG image, write a real tagline, pick a category. |
| **Day 0, T+7 min** | Flip to LIVE. Public page is at `/products/[slug]`. IndexNow pings Bing. |
| **Day 0, T+15 min** | Invite the first 10 customers to review. `ReviewInviteEmail` goes out. |
| **Day 0, T+30 min** | Schedule a launch for 3 days out. `launch-tick` will email D-3 and D-1 reminders and flip the launch to LIVE automatically. |
| **Day 1** | Click **Refresh directory recommendations** → 25 rows. Submit to 10 form-only directories using AI-generated copy. |
| **Day 1** | Add their domain to `/app/seo`. First SeoSnapshot lands within 5 minutes. |
| **Day 2** | First reviews arrive. Some get auto-flagged (`fakeScore >= 0.7`) - founder approves or removes. Replies to real reviews; reviewers get `ReviewRepliedEmail`. |
| **Day 2** | Connect Stripe. `mrr-sync-tick` writes the first MrrSnapshot that night. Verified MRR badge appears on the public page. |
| **Day 3** | Launch day. `LaunchLiveEmail` fires at the scheduled minute; `/today` shows the product on the leaderboard. Upvotes + comments stream in. |
| **Day 3, UTC end-of-day** | `launch-tick` flips the launch to ENDED and assigns a final rank. |
| **Day 7** | First `WeeklySeoDigestEmail` lands with impressions / clicks / top query / top page. Founder now has a live public page, verified reviews with JSON-LD, MRR badge, directory backlinks starting to land, and a programmatic `/best/<category>` + `/compare/*` surface pulling in organic traffic. |

---

## 15. What explicitly does *not* exist yet

These are called out so expectations match reality. Each lines up with unchecked items in [ROADMAP.md](./ROADMAP.md):

- **In-app notification bell** (`Notification` row + UI). Email paths are live for every critical event; the in-app bell is V1.
- **Competitor SEO compare tab** and **backlink change alerts** (gained / lost) - data plumbing exists, UI is V1.
- **Storybook publish** for `packages/ui`.
- **Toast primitive** and composable form primitives. (Server actions handle errors via thrown messages surfaced inline today.)
- **Full Lighthouse 90+ pass** and **axe scan** against a staging URL.
- **Sentry** (web + worker) and **Better Stack** uptime + status page.
- **Production deploy pipeline** - GitHub Actions to Vercel for web and EC2/Fargate for the worker (`apps/worker/Dockerfile`), secrets in AWS Secrets Manager.
- **Backup / restore drill** on RDS.
- **`track()` coverage** on the remaining billing / directory / SEO / AI event codes.
- **Reviewer magic-link sign-in** so the reviewer's `User` row is auto-attached (currently links by email match only).
- **Admin CSV-import** for directories (seed file is still the source of truth).
- **Rich-text editor** for `DirectorySubmission.generatedDescription` overrides (plain textarea today).

---

## 16. Quick file map (where each feature lives)

- Onboarding flow → `apps/web/src/app/app/onboarding/onboarding-flow.tsx`
- Product CRUD → `apps/web/src/app/app/products/actions.ts`
- Public product page → `apps/web/src/app/products/[slug]/page.tsx`
- Upvote + comments → `apps/web/src/app/products/[slug]/actions.ts`
- Launch scheduler → `apps/web/src/app/app/launches/actions.ts` + `apps/worker/src/handlers/launch.ts`
- Review invite tokens → `packages/auth/src/tokens.ts`
- Review submission → `apps/web/src/app/review/[token]/actions.ts`
- Founder reply inbox → `apps/web/src/app/app/products/[id]/reviews/*`
- Directory recommendations → `packages/ai/prompts/recommend-directories.ts` + `apps/worker/src/handlers/directory.ts`
- Directory verification → `apps/worker/src/handlers/directory.ts`
- SEO dashboard → `apps/web/src/app/app/seo/*`
- MRR sync → `apps/worker/src/handlers/mrr.ts`
- Razorpay webhook → `apps/web/src/app/api/v1/razorpay/webhook/route.ts`
- Plan gating → `packages/billing/src/gating.ts`
- Global search → `packages/search/*` + `/api/v1/search` + `<GlobalSearch />`
- Programmatic SEO → `apps/web/src/app/categories/*`, `apps/web/src/app/best/[category]/*`, `apps/web/src/app/compare/[slug]/*`
- Sitemap shards → `apps/web/src/app/sitemap.ts`
- IndexNow ping → `apps/web/src/lib/indexnow.ts` + `/api/v1/indexnow/key`
- Admin moderation → `apps/web/src/app/app/admin/moderation/*`
- Audit log → `apps/web/src/lib/audit.ts` + `/app/admin/audit`
- Email templates → `packages/email/src/templates/*.tsx`
- PostHog events → `packages/analytics/src/events.ts`

---

Last updated: 2026-04-19 (end of Sprint 8 - partial).
