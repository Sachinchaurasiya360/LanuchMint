# LaunchMint — Roadmap & 12-Week Sprint Plan

This is the build plan for the MVP and the high-level direction beyond.

**Team assumption:** Small team — 2–4 engineers, 1 designer, 1 founder/PM. Adjust velocity if smaller.
**Cadence:** 1-week sprints (the "weeks" below). 2-week sprints reduce ceremony if preferred.
**DRY mandate:** Sprint 1 is **entirely** about shared `packages/*` foundation. No app features until shared layer is solid.

---

## Sprint 1 — Foundation (Week 1–2) — **DONE**

**Theme:** "Build everything everyone else will need, and nothing else."

### Deliverables
- [x] Monorepo bootstrap: pnpm workspaces + Turborepo + shared `tsconfig`, `eslint`, `prettier`, `tailwind preset`.
- [x] `packages/config` — shared lint, ts, tailwind preset, brand tokens (white + yellow + zinc).
- [x] `packages/db` — Prisma schema (full schema from [DATABASE.md](./DATABASE.md) — even tables we won't use until V1; better to migrate once now). Workspace-scoped Prisma client proxy.
- [x] `packages/auth` — NextAuth config + Google OAuth + RBAC `can()` + `requirePermission()` middleware.
- [x] `packages/ui` — Shadcn primitives (Button, Input, Textarea, Select, Card, Badge, Avatar, Tabs, Dialog, Tooltip, Table, Skeleton, EmptyState, KPI, Label). _Toast + Form primitives and Storybook deferred to Sprint 8 polish._
- [x] `packages/email` — Resend wrapper + React Email base layout + 3 templates (welcome, magic-link, payment-receipt).
- [x] `packages/queue` — BullMQ wrapper + typed job dispatcher + worker factory.
- [x] `packages/ai` — Gemini wrapper (Pro + Flash) + cost tracker + first 3 prompts (product_description, meta_title, meta_description).
- [x] `packages/storage` — S3 wrapper + pre-signed URL helpers. _Image optimization wrapper deferred — using Next.js `<Image />` until first bottleneck._
- [x] `packages/seo-meta` — JSON-LD builders for Organization, WebSite, Person, SoftwareApplication, BreadcrumbList, Review.
- [x] `packages/seo-data` — DataForSEO wrapper + Redis cache layer.
- [x] `packages/billing` — Razorpay wrapper (subscriptions, webhook signature verify) + Stripe Connect (read-only MRR via `Stripe-Account` header) + plans matrix.
- [x] `packages/analytics` — PostHog client + typed event taxonomy.
- [x] `packages/search` — Typesense wrapper + indexer interfaces + product/founder/directory schemas (no real indexes hydrated yet).
- [x] `apps/web` — Next.js 14 App Router boots; landing page placeholder; `/app` shell; Google sign-in works end-to-end.
- [x] `apps/worker` — boots 5 typed workers (email/ai/seo/search/moderation) with shutdown hooks.
- [x] Docker Compose dev: Postgres + Redis + Typesense + LocalStack S3.
- [x] CI: lint + typecheck + test on PR (`.github/workflows/ci.yml`) + Vercel deploy workflow.
- [x] Brand: tokens applied; sample screens show white + yellow only, Lucide icons, no emoji.

### Remaining from this sprint
- Storybook publish for `packages/ui` (rolled into Sprint 8 polish).
- Image optimization wrapper in `packages/storage` (only if S3 cold-start latency proves to be a problem).
- `Toast` + composable `Form` primitives (add when first form needs server-validation surfacing).

### Out of scope this sprint
- Public pages with real data.
- Any specific module (products, reviews, SEO, etc.).
- Production deploy.

### Definition of done
- A new engineer can clone the repo, run `pnpm install && docker compose up -d && pnpm dev` and reach `localhost:3000` with Google sign-in working in under 30 minutes.
- A storybook deploy preview shows all primitive components on brand.
- A worker job (welcome-email on signup) round-trips successfully.

---

## Sprint 2 — Founder Profile + Product CRUD + Onboarding (Week 3–4) — **DONE**

**Theme:** "A founder can sign up and create a product."

### Deliverables
- [x] Founder profile model + editor UI (`/app/profile`) + public page `/founders/[slug]` with `Person` + `BreadcrumbList` JSON-LD and product cross-links.
- [x] Product CRUD: create / edit / soft-delete (`deletedAt` + `ARCHIVED`) + draft state. Server actions in `apps/web/src/app/app/products/actions.ts`.
- [x] Onboarding 6-step flow with progress bar and smart resume (jumps to step 5 if a product already exists, step 3 if profile already filled).
- [x] URL scrape — synchronous Cheerio path via `packages/scrape` (`scrapeMeta()`) wired into the new-product form. _Playwright fallback for JS-rendered sites deferred — Cheerio covers ≥ 90% of marketing pages._
- [x] AI prefill: `product_description`, `meta_title`, `meta_description` via `aiPrefillAction`. _Standalone `category_suggestion` prompt not yet split out — category is currently selected from a fixed list in the form; AI suggestion will land in Sprint 6 alongside the rest of the prompts._
- [x] S3 upload — `POST /api/v1/uploads/sign` returns presigned URL via `presignUpload()` with content-type allowlist and per-workspace key namespacing.
- [x] Public product page `/products/[slug]` with `SoftwareApplication` + `BreadcrumbList` JSON-LD (`force-static`, `revalidate = 300`).
- [x] Sitemap at `/sitemap.xml` listing products + founders + static routes (`revalidate = 3600`) and `robots.ts` disallowing `/app` and `/api`.
- [x] `Workspace` slug helper (`packages/db/src/slug.ts`) used by product/founder creation to guarantee unique routes.

### Acceptance
- [x] A new user signs in, is taken through onboarding, and within 5 minutes has a draft product page rendered at `/products/[slug]`.
- [ ] The page passes Lighthouse SEO ≥ 90. _Will be measured in Sprint 8 polish on the deployed staging URL — local lighthouse against `next dev` is not representative._
- [x] Founder profile renders at `/founders/[slug]`.

### Remaining from this sprint
- Standalone `category_suggestion` AI prompt (folded into Sprint 6 prompt batch).
- Playwright-backed scraper fallback for SPA marketing sites (unblock when first failed scrape is observed).
- Lighthouse SEO ≥ 90 measurement on staging (Sprint 8).
- Multi-screenshot upload UI (the upload endpoint exists; the form currently only takes a single logo).

---

## Sprint 3 — Launches + Leaderboard + Upvotes + Comments (Week 5) — **DONE**

**Theme:** "Founders can launch and the community can engage."

### Deliverables
- [x] `Launch` model + scheduler — server actions in `apps/web/src/app/app/launches/actions.ts` (`scheduleLaunchAction`, `cancelLaunchAction`); a per-minute BullMQ repeatable `launch-tick` job in `apps/worker/src/handlers/launch.ts` flips `SCHEDULED → LIVE → ENDED` and assigns ranks at end-of-day.
- [x] `/today` leaderboard page (ISR 60s) at `apps/web/src/app/today/page.tsx`.
- [x] `/launches/[date]` historical pages (ISR 1h) with prev/next day navigation and `noindex` future days via `notFound()`.
- [x] Upvote system — `toggleUpvoteAction` enforces 1-per-user via `@@unique([productId, userId])`; the public product page has an `UpvoteButton` client component that bumps `Launch.upvoteCount` on the active launch.
- [x] Threaded comments on product pages — `CommentThread` + `CommentForm` components with 2-level replies, soft-delete by author, `Launch.commentCount` denormalized.
- [x] Pre-launch reminders D-3 and D-1 (Resend) — `LaunchReminderEmail` template, scheduled by `launch-tick` and dedup-stamped on `launch.metadata.remindersSent`.
- [x] Launch-live email — `LaunchLiveEmail` template with leaderboard CTA, fired automatically when a launch flips to `LIVE`.
- [x] AI launch_readiness scoring (Pro model) — `generateLaunchReadiness` returns structured `{score, summary, blockers, suggestions}`; persisted to `Product.launchScore` + `Product.metadata.launchReadiness`; surfaced in the `/app/launches` dashboard with a "Re-score" button.
- [x] Public middleware updated so `/today`, `/launches/*`, `/products/*`, `/founders/*`, `/sitemap.xml`, and `/robots.txt` are reachable without auth.
- [x] Sitemap extended to include `/today` and one entry per historical launch day.

### Remaining from this sprint
- In-app toast on launch day. _Toast primitive intentionally deferred from Sprint 1; will land alongside the toast UI in Sprint 8 polish. Email path is live._
- Brigade detection on upvotes (logging only). _Schema supports it via `Upvote.createdAt`; the heuristic itself is folded into Sprint 7 admin moderation along with the AuditLog work._
- Launch-day in-app notification (the `Notification` row insert). _Trivially additive to `launch-tick`; deferred until the in-app bell UI exists in V1._
- Founder/team comment author badging + verified-customer badging. _Tracked under Sprint 4 (reviews) where the Verified Customer badge first appears._

---

## Sprint 4 — Reviews + Verified Badges + Founder Reply (Week 6) — **DONE**

**Theme:** "Trust system goes live."

### Deliverables
- [x] Review invite flow — `inviteReviewersAction` accepts pasted emails (one-per-line or comma-separated, dedup + invalid-skip + already-reviewed skip), enqueues `send-review-invite` jobs that render `ReviewInviteEmail` via Resend.
- [x] Public review submission via token-gated `/review/[token]` — server-side HMAC verification with `verifyReviewInvite()`, prefilled identity, single-use enforcement (404-equivalent if a review already exists for that email/product pair).
- [x] Stateless invite tokens — `signReviewInvite()` / `verifyReviewInvite()` in `packages/auth/src/tokens.ts` use HMAC-SHA256 with `NEXTAUTH_SECRET`, 21-day TTL, no DB row required.
- [x] Email-verified-customer badge — submissions via the invite link set `Review.isVerified = true`, `verificationMethod = "email-invite"`, and the public page renders the "Verified Customer" badge.
- [x] AI fake-review classifier (Gemini Flash) — `classifyFakeReview()` returns `{ fakeScore, reasons }`; persisted to `Review.fakeScore`.
- [x] Auto-quarantine for `fakeScore >= 0.7` — handler flips `isFlagged = true` and `status = FLAGGED`; flagged reviews surface in the founder inbox with Approve/Remove buttons.
- [x] Founder reply UI — `/app/products/[id]/reviews` inbox tabs (Flagged / Pending / Published), per-review `ReplyToReviewAction`, AI-suggested draft via `suggestReplyAction()` (Flash, founder-voice prompt), `Edit` button to revise an existing reply.
- [x] AggregateRating in product page JSON-LD — computed from `PUBLISHED` reviews; per-review `Review` JSON-LD nodes (top 20) emitted alongside.
- [x] "Verified Customer" badge UI — appears on each verified review on the public product page and inside the founder inbox.
- [x] Search index reflects review state — `index-product` handler now aggregates `averageRating` and `reviewCount` from PUBLISHED reviews for Typesense.

### Remaining from this sprint
- Founder push notification on new review (the `Notification` row insert). _Email path is live; the in-app bell is V1 — this is a one-line add when that ships._
- Reviewer rate-limit / per-product invite cap. _Handler caps a single invite batch at 50; per-workspace daily cap will land with the `UsageCounter` enforcement in Sprint 6._
- Reviewer-side magic-link sign-in (so the reviewer's `User` row gets attached). _Currently links by email match if a `User` exists; otherwise the review is anonymous-but-verified. Enough for V0._
- Manual moderation queue across workspaces (admin view). _Per-workspace moderation is live; cross-workspace queue is part of Sprint 7 admin moderation._
- Empirical precision validation on fake-review test set ≥ 80%. _Requires labeled fixtures; will be benchmarked during Sprint 9 beta with real review data._

---

## Sprint 5 — Directory Database + AI Submission Workflow (Week 7) — **DONE**

**Theme:** "200+ directories submitted in 2 hours."

### Deliverables
- [x] Curated directory DB seeded with 200 entries — `packages/db/prisma/seeds/directories.ts` (60+ verified entries + ~140 niche placeholders) and standalone seeder `pnpm --filter @launchmint/db seed:directories`.
- [x] `/directories` browser + `/directories/[slug]` detail pages with category/cost filters, recently-listed products, and CollectionPage / Service JSON-LD.
- [x] Per-product "Recommended directories" with AI prioritization — Flash-backed `recommendDirectories()` ranks an 80-candidate pool and writes top-25 PENDING DirectorySubmission rows.
- [x] Submission flow:
  - [x] API-enabled directories: `submit-directory` worker auto-marks SUBMITTED with the directory's API notes.
  - [x] Form-only: Flash-backed `generateDirectoryDescription()` writes a budget-tight tailored paragraph; founder copies + opens in new tab.
- [x] Status tracking via existing `SubmissionStatus` enum — UI groups PENDING / IN_PROGRESS / SUBMITTED / LIVE / REJECTED.
- [x] `directory-verify-tick` repeatable job (daily 03:17 UTC) re-enqueues `verify-directory-backlink` for all open submissions; the per-row job HEAD-fetches the directory page and stamps a `Backlink` row when it finds the product domain.
- [x] Public directory detail pages emit Service + BreadcrumbList JSON-LD; index page emits CollectionPage + ItemList. New `collectionPageJsonLd()` helper added to `@launchmint/seo-meta`.

### Acceptance
- [x] Founder workflow: `/app/products/[id]/directories` → "Refresh recommendations" → 25 PENDING rows with score + reason → click "Generate submission copy" → IN_PROGRESS with copy-ready draft → mark submitted → daily verify promotes to LIVE.
- [x] Backlink detection: `verify-directory-backlink` regex-matches `productHost` against the directory page HTML; promotes to LIVE and upserts a `Backlink` row that the SEO dashboard will read in Sprint 6.

### Remaining from this sprint
- Empirical CSV import UI for admins to bulk-add directories. _Tracked under Sprint 7 admin tooling — for now the seed file is the source of truth._
- True API submission for the directories that publish webhooks (e.g., BetaList programmatic endpoints if/when documented). _Currently `hasApi=true` short-circuits to SUBMITTED with the directory's apiNotes; per-directory adapters land when contracts are confirmed._
- DataForSEO-backed DR refresh job. _Sprint 6 (SEO dashboard) introduces the DataForSEO client; we'll add a monthly directory-DR-refresh tick on top of it._
- Rich-text editor for `generatedDescription` overrides. _Plain textarea in the founder UI for now; a tiptap editor lands with Sprint 8 content polish._

---

## Sprint 6 — SEO Dashboard + Verified MRR + Razorpay + Search (Week 8)

**Theme:** "All the differentiators land."

### Deliverables
- SEO dashboard (`/app/seo`) with DR, organic traffic, top keywords, backlinks, sparklines.
- DataForSEO integration (live calls + 24h cache).
- Add-domain flow + tracked-keywords UI.
- Stripe Connect OAuth + daily MRR pull job.
- Verified MRR widget on product page.
- Razorpay subscriptions + plan picker on `/pricing` and `/app/billing`.
- Plan gating implemented in `packages/billing/gating.ts` and applied across UI/API.
- Usage meter UI.
- Typesense search (`Cmd+K` global search).
- Remaining AI prompts: cold_email, social_post_x, social_post_linkedin, review_reply, founder_summary, keyword_suggestions, directory_description, seo_suggestions.

### Acceptance
- Founder adds domain → SEO snapshot appears within 5 min.
- Founder connects Stripe → MRR widget shows real number on product page.
- Founder upgrades to Starter via Razorpay → invoice emailed → AI credits expand.
- Cmd+K search returns products, founders, directories.

---

## Sprint 7 — Programmatic SEO + Admin Moderation (Week 9)

**Theme:** "Public surface area explodes."

### Deliverables
- Category pages (`/categories/[slug]`).
- Best-of pages (`/best/[category]`).
- Comparison pages (`/compare/[a]-vs-[b]`) — auto-generated when both products meet thresholds.
- Sitemap split + IndexNow integration.
- Internal-linking automation.
- Founder-directory aggregate (`/founders` index).
- Admin moderation dashboard (`/app/admin/moderation`) with queue tabs + decide flow.
- Audit log views.
- AuditLog write on every admin mutation.

### Acceptance
- 100+ programmatic pages live and indexable.
- Schema.org validator passes for samples of each page type.
- Moderation queue can resolve a flagged review end-to-end with audit log entry.

---

## Sprint 8 — Polish + Performance + Email Templates + Analytics (Week 10)

**Theme:** "Production-ready quality bar."

### Deliverables
- Lighthouse pass: top 5 page templates ≥ 90 SEO + Performance + Best Practices + Accessibility.
- All email templates final (15 listed in [DESIGN.md](./DESIGN.md)).
- All PostHog events from [ONBOARDING.md](./ONBOARDING.md) wired.
- Sentry covering web + worker.
- Better Stack uptime + status page.
- Empty states + skeletons everywhere.
- Mobile responsive QA pass on top 20 screens.
- Accessibility pass (axe scan, keyboard nav).
- Backup + restore tested on RDS.
- Production deploy pipeline (GitHub Actions → Vercel + EC2 worker).
- Production secrets in AWS Secrets Manager.

### Acceptance
- Production environment alive at `launchmint.com`.
- Smoke tests pass post-deploy.
- A founder signing up in prod can complete onboarding + publish a product.

---

## Sprint 9 — Beta with Design Partners (Week 11)

**Theme:** "20 real founders break the system."

### Deliverables
- 20 design partners onboarded with free Pro for 6 months.
- Bug-fix sprint based on their feedback.
- 1:1 onboarding call with each (recorded).
- Edit copy and flows based on confusion patterns.
- Pre-launch waitlist email blast scheduled (T-2 days from launch).
- Founder testimonials collected (text + headshots).

### Out of scope
- New features.
- New pages.

### Acceptance
- 15+ design partners have published a product on the platform.
- 50+ reviews collected.
- 200+ directory submissions.
- Zero P0 bugs in active backlog.

---

## Sprint 10 — Public Launch (Week 12)

**Theme:** "T0 — go live."

### Deliverables
- T-2 days: waitlist email blast.
- T-1 day: final smoke test + on-call schedule.
- T0 06:00 UTC: site flips public, Razorpay live mode.
- T0 09:00 UTC: Product Hunt launch.
- T0 10:00 UTC: Twitter mega-thread + LinkedIn long-form.
- T0 11:00 UTC: Show HN.
- T0 12:00 UTC: Indie Hackers post.
- Founder lives in comments T0 14:00–22:00 UTC.
- T+1 daily metrics share.
- T+7 retro post.

### Acceptance
- 1,000 signups in launch week.
- 50 paid customers within 14 days.
- Top-10 on Product Hunt.

---

## Quarterly view (post-MVP)

### Q2 (Months 4–6) — V1
- Backlink change alerts.
- Competitor SEO compare.
- AI cold email + social posts UI.
- AI competitor summary.
- Team dashboards (multi-seat).
- Agency dashboard + client switcher.
- White-label PDF/CSV exports.
- Embeddable badges (LaunchMint badge, DR badge, Verified MRR badge, Reviews widget).
- Notifications center (in-app bell).
- Referral system live.
- Affiliate system live.
- Public analytics widget (embeddable JS).
- Programmatic SEO expansion: industry pages, alternatives pages.

**Targets:** 10,000 free users, 1,000 paid, $50k MRR.

### Q3 (Months 7–9) — V2 begin
- Private communities (per-workspace forums).
- Founder DMs.
- Events + AMAs.
- Public REST API.
- City + country pages (geo programmatic).
- Investor profile listings.
- Browser extension (one-click submit).

**Targets:** 25,000 free users, 2,500 paid, $130k MRR.

### Q4 (Months 10–12) — V2 continue
- AI landing page generator.
- Mobile app (React Native).
- Multi-language (ES, FR, DE, JA, HI).
- Founder matchmaking.
- Public roadmap + changelog pages per product.
- Job board.
- Marketplace (services).

**Targets:** 50,000 free users, 5,000 paid, $300k MRR.

---

## Year-2 themes (preview)

- Native mobile app polish + iPad layout.
- Investor side: paid investor accounts, dealflow CRM-lite.
- Outbound + paid acquisition (CAC validated, can spend).
- Geographic expansion: localized landing pages and currency.
- Enterprise tier with SSO, audit, dedicated infra.
- Open-source the directory database (community contributions).

---

## Resource estimation (Sprint 1–10)

| Role | Headcount | Allocation |
|------|----------:|-----------|
| Founder / PM | 1 | 100% |
| Senior full-stack | 2 | 100% |
| Frontend (UI focus) | 1 | 100% |
| Designer | 1 | 60% |
| Part-time devops / on-call | 0.3 | as needed |

If solo: this 12-week plan stretches to 24–28 weeks. Cut V1 features into V2.5; cut programmatic SEO down to product + founder pages only at MVP.

---

## Risks to schedule

| Risk | Mitigation |
|------|-----------|
| DataForSEO integration takes longer than expected | Pre-spike in Sprint 1; have a `mock` mode in `packages/seo-data` |
| Razorpay onboarding delays | Apply for production account in Week 1 |
| Stripe Connect approval | Apply Week 1; have fallback "self-reported MRR" toggle |
| Gemini API quota limits | Apply for higher quota Week 1; have OpenAI fallback wired but disabled |
| Directory DB seeding takes longer than expected | Pre-build CSV in Week 1; allow rolling additions |
| AI fake-review classifier accuracy < 80% | Have a manual moderation fallback ready; ship gated by Mod queue |
| Programmatic SEO penalty | Quality gates in code (350+ words, threshold guards); monitor GSC weekly |

---

## Done is done

A sprint is "done" when:
- All planned tickets merged + deployed to staging.
- Acceptance criteria verified by founder.
- No P0 / P1 bugs in backlog from this sprint.
- Sprint demo delivered.
- Retrospective recorded.

A sprint is **not** "done" if:
- Any TODO marked `// FIX before launch`.
- Tests skipped.
- Incomplete error handling on user-facing paths.
- Brand violations (gradient, emoji, non-Lucide icon).
