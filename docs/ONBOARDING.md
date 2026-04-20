# LaunchMint - Onboarding, Checklists, Workflows, Analytics

This document covers user onboarding, launch checklists, moderation workflows, SEO workflows, analytics events, and KPIs.

---

## Onboarding flow (target: < 5 min to first launch draft)

### Step 0 - Sign in
- One-click Google OAuth.
- New user → workspace auto-created (`{firstName}-workspace`).
- Free plan auto-assigned.

### Step 1 - "What's your product URL?"
- Single input.
- On submit: `scrape-meta` job runs in background while user sees prefilled-in-progress UI.
- Skips allowed - empty product can be filled manually.

### Step 2 - Confirm product details
- AI-prefilled: name, tagline, 250-word description, category, 5 SEO keywords, meta title, meta description.
- Founder edits inline.
- Logo extracted from favicon / og:image; founder can upload a better one.

### Step 3 - Confirm founder details
- Pre-filled from Google account (name, email, avatar).
- Adds: headline (placeholder: "Founder of [product]"), location, X handle, LinkedIn URL.
- Generates founder slug (`/founders/[slug]`).

### Step 4 - Choose launch date
- Two options: "Launch today" (immediate) or "Schedule" (date picker, 1–60 days out).
- Timezone defaults to browser TZ.

### Step 5 - Connect Stripe (optional, skippable)
- Banner: "Connect Stripe to display verified MRR - boosts trust score by 15 points."
- Clicking opens Stripe Connect OAuth.
- Skip → can be done later from Settings.

### Step 6 - Pick directories to submit to (optional, skippable)
- AI-prioritized top 25 directories shown, pre-selected.
- Founder unchecks any they don't want.
- Click "Generate descriptions" → AI generates per-directory description in background.
- Skip → all directories deferred to Directories tab.

### Step 7 - Review & publish
- Live preview of `/products/[slug]` page (in iframe).
- Launch readiness score shown (out of 100) with checklist of what's missing.
- Two CTAs: "Save as draft" or "Publish" (yellow).

### Post-onboarding
- Land on `/app` home with confetti-free celebration card: "Your product is live at launchmint.com/products/[slug]".
- KPI dashboard activates.
- Resend dispatches welcome email.

---

## Onboarding checklist (in-app, until 100%)

Persistent card on `/app` home until all items complete:

- [ ] Add a product (10 pts)
- [ ] Complete founder profile - bio, location, social links (10 pts)
- [ ] Add product logo (5 pts)
- [ ] Add at least 3 screenshots (10 pts)
- [ ] Complete product description (≥ 200 words) (10 pts)
- [ ] Tag at least one category (5 pts)
- [ ] Schedule a launch (10 pts)
- [ ] Invite first 3 review prospects (10 pts)
- [ ] Submit to first directory (10 pts)
- [ ] Connect Stripe for verified MRR (10 pts)
- [ ] Embed "Featured on LaunchMint" badge on your site (10 pts)

Score → Launch readiness percentage. Hides when 100%.

---

## Launch checklist (per launch - surfaced inside `/app/launches/[id]`)

- [ ] Product name confirmed
- [ ] Tagline (5–12 words) approved
- [ ] Long description (350+ words) approved
- [ ] Category set
- [ ] Logo uploaded (256×256 minimum)
- [ ] OG image generated (1200×630)
- [ ] At least 3 screenshots OR 1 demo video
- [ ] Founder profile complete
- [ ] Pricing model declared
- [ ] At least 5 reviewer emails added
- [ ] Top 25 directories selected with descriptions
- [ ] Launch X / LinkedIn drafts ready (AI-generated, founder-edited)
- [ ] Email blast list connected (CSV upload)
- [ ] Stripe connected (recommended)
- [ ] Launch date confirmed in correct timezone
- [ ] Schema.org markup verified (auto-checked)
- [ ] Page passes Lighthouse ≥ 90 SEO + Performance

System blocks LIVE publication if score < 70 (founder can override with explicit "Launch anyway" + warning modal).

---

## Moderation workflows

### Triggers
- AI fake-review classifier scores ≥ 0.7 → review enters moderation queue.
- User-flagged review or comment → enters moderation queue.
- Three-strike auto-suspend → user enters moderation queue.
- Reported product (TOS violation) → enters moderation queue.

### Queue (`/admin/moderation`)
- Tabs: Reviews / Comments / Products / Users / Flagged content
- Per item: actor, target, AI score, flag reason, decide buttons.

### Decision actions
- **Approve** → publishes, removes flag, logs to AuditLog.
- **Remove** → marks `status: REMOVED`, sends notification to author via Resend explaining reason.
- **Escalate** → assigns to SuperAdmin (e.g., legal-sensitive cases).
- **Suspend user** → SuperAdmin only; suspends account, preserves data, sends notification.

### SLA
- Tier-1 moderation: triage within 24h.
- Critical (legal, harassment): 4h.
- Tracked in AuditLog with timestamps.

### Appeals
- Removed content authors get email with reason + appeal link.
- Appeal goes back to queue with `escalated: true` flag.

---

## SEO workflows

### Per-product daily
1. **02:00 UTC** - `seo-daily` job runs for all tracked domains: pulls DR, organic traffic, spam score from DataForSEO. Stores in `SeoSnapshot`.
2. If DR drops > 5 points → trigger alert (V1).
3. If spam score > 30 → flag in admin queue.

### Per-product weekly (Mon 03:00 UTC)
1. **`seo-weekly`** - pulls top 100 backlinks + keyword rankings.
2. Compare to last week's snapshot:
   - New backlinks → log + push to Notification queue (V1).
   - Lost backlinks → log + push to Notification queue.
   - Keywords newly in top-10 / top-3 → notify.
   - Keywords lost from top-10 → notify.
3. Email digest (`weekly-seo-digest.tsx`) dispatched to each founder Monday 09:00 founder TZ.

### Per-product monthly
1. AI re-runs keyword recommendations.
2. AI re-scores SEO completeness; nudges founder if score dropped.

### Platform-wide weekly
1. Sitemap rebuild (auto on every publish, but full rebuild Sunday 02:00 UTC).
2. Broken-link crawl on all `/products/[slug]` (check website still up).
3. Schema.org validation on 1% sample.
4. Lighthouse run on 10 random public pages (regression check).

---

## Suggested analytics events (PostHog)

### Auth & lifecycle
```
user_signed_up                    { source, ref?, aff? }
user_logged_in                    { method }
user_completed_onboarding         { steps_skipped, time_to_complete_seconds }
user_deleted_account              { reason? }
```

### Product
```
product_created                   { product_id, source: "onboarding"|"manual" }
product_published                 { product_id, launch_score }
product_updated                   { product_id, fields_changed: [] }
product_archived                  { product_id }
product_scrape_initiated
product_scrape_completed          { duration_ms, success }
```

### Launch
```
launch_scheduled                  { product_id, scheduled_at, days_out }
launch_went_live                  { product_id, launch_score }
launch_ended                      { product_id, final_rank, total_upvotes, total_comments }
upvote_cast                       { product_id }
upvote_removed                    { product_id }
comment_posted                    { product_id, parent_id? }
```

### Reviews
```
review_invite_sent                { product_id, count }
review_invite_clicked             { token }
review_submitted                  { product_id, rating, verified, fake_score }
review_replied                    { review_id }
review_flagged                    { review_id, by: "user"|"ai" }
review_moderated                  { review_id, decision }
```

### Directories
```
directory_viewed                  { directory_id }
directory_selected                { directory_id, product_id }
directory_submitted               { directory_id, product_id, method: "auto"|"manual" }
directory_went_live               { directory_id, product_id, days_to_live }
directory_rejected                { directory_id, product_id }
directory_recommendations_loaded  { product_id, count }
```

### SEO
```
seo_dashboard_viewed              { product_id }
seo_domain_added                  { product_id, domain }
seo_competitor_added              { product_id, competitor_domain }
seo_refresh_triggered             { product_id, type }
backlink_alert_triggered          { product_id, type: "gained"|"lost", count }
keyword_added                     { product_id, keyword }
```

### AI
```
ai_generation_requested           { type, model, credits_charged, latency_ms, status }
ai_generation_accepted            { generation_id }
ai_generation_rejected            { generation_id, reason }
ai_quota_warning                  { workspace_id, percent_used }
ai_quota_exceeded                 { workspace_id }
```

### MRR
```
mrr_widget_connected              { workspace_id }
mrr_synced                        { product_id, mrr_cents, currency }
mrr_disconnected                  { workspace_id }
```

### Billing
```
billing_pricing_viewed
billing_checkout_started          { plan, interval }
billing_checkout_completed        { plan, interval, amount_cents }
billing_subscribed                { plan }
billing_upgraded                  { from, to }
billing_downgraded                { from, to }
billing_canceled                  { plan, reason? }
billing_payment_failed            { plan }
billing_renewed                   { plan }
```

### Growth
```
referral_link_shared              { channel }
referral_signup                   { code }
referral_converted                { code, plan }
affiliate_signup
affiliate_conversion              { code, plan }
badge_embedded                    { badge_type, host_domain }
```

### Agency / Team
```
team_member_invited
team_member_joined
agency_client_added
report_exported                   { format: "pdf"|"csv", scope }
```

### Admin
```
moderation_decided                { item_type, decision }
badge_issued                      { type, target_user_id }
user_suspended                    { reason }
```

---

## Suggested KPIs (founder dashboard, weekly review)

### North Star
- **WAF-LRD:** Weekly Active Founders who Launched, Reviewed, or Submitted to a Directory

### Acquisition
- Weekly signups
- Signup → activation (created product) within 7 days
- Organic traffic / signup ratio
- Top 10 referring sources

### Activation
- % new users completing onboarding
- % publishing first product within 7 days
- % collecting first review within 14 days
- % submitting to first directory within 14 days

### Engagement
- Weekly active workspaces
- Reviews collected per active product
- Directory submissions per active product
- AI credits consumed per active workspace

### Retention
- W1, W4, W12 retention curves (cohort)
- Free → paid conversion 30/60/90
- Net revenue retention (paid cohort)

### Revenue
- MRR
- ARPU
- LTV
- Gross margin
- CAC payback (when paid spend begins)

### Product quality
- Launch readiness score median
- Trust score median
- Verified review percentage
- Fake-review false-positive rate
- Moderation queue resolution p95

### System
- API p95 latency
- Worker queue depth
- DataForSEO + Gemini cost / paid user
- Uptime

---

## 12-week sprint plan (MVP build)

See [ROADMAP.md](./ROADMAP.md) for the full sprint plan. Summary table:

| Sprint | Weeks | Focus | Deliverable |
|-------:|:-----:|-------|-------------|
| 1 | 1–2 | Foundation | All `packages/*` stubs + Google OAuth + base layouts + brand system |
| 2 | 3–4 | Product + founder profile | Product CRUD, founder profile, onboarding scrape, S3 uploads |
| 3 | 5 | Launches | Schedule, leaderboard, upvotes, comments |
| 4 | 6 | Reviews | Invite, submit, fake detection, founder reply |
| 5 | 7 | Directories | DB seeding (200+), AI prioritization, submission tracking |
| 6 | 8 | SEO + AI + Billing | DataForSEO dashboard, Stripe MRR, AI suite, Razorpay billing, search |
| 7 | 9 | Programmatic SEO + admin | All public pages live, sitemap, IndexNow, admin moderation dashboard |
| 8 | 10 | Polish + perf | Lighthouse pass, email templates final, analytics wired |
| 9 | 11 | Beta with design partners | 20 founders using; bugs fixed |
| 10 | 12 | Public launch | T0 launch day |

---

## Suggested moderation workflows (cheat sheet)

| Event | Auto-action | Human review |
|-------|-------------|--------------|
| Review fake_score ≥ 0.7 | Quarantine | Yes (24h) |
| Review user-flagged | Keep visible, queue | Yes (24h) |
| Comment toxic_score ≥ 0.7 | Hide pending | Yes (24h) |
| Spam pattern signup (3+ accounts/IP) | Block signup | Yes (escalate) |
| Brigade upvote pattern | Discount votes | Yes (logged) |
| Product TOS violation flag | Keep live | Yes (8h SLA) |
| Founder impersonation report | Hide profile | Yes (4h SLA) |
| DMCA / legal | Hide immediately | Escalate to founder |

---

## Suggested SEO workflows (cheat sheet)

| Event | Action |
|-------|--------|
| Product publish | ISR build, sitemap update, IndexNow ping, internal links inserted |
| Product update (name/description/category) | Same as above |
| Review published | Re-render product page (AggregateRating updated) |
| New backlink detected | Log; alert founder (V1) |
| Lost backlink detected | Log; alert founder (V1) |
| Keyword enters top 10 | Log; alert founder |
| Comparison page eligible (3+ reviews each side) | Auto-generate, internal-link, ping IndexNow |
| Founder profile published | Sitemap update, IndexNow ping |

---

## Suggested subscription gating (cheat sheet)

| Surface | Gate type | Trigger |
|---------|-----------|---------|
| AI generate button | Hard | Out of credits |
| Verified MRR widget | Inline lock | Free plan |
| 2nd / 3rd product | Modal | Plan limit |
| Backlink alerts (V1) | Inline lock | Free / Starter |
| Competitor compare | Inline lock | Starter only allows 1 |
| Custom domain | Inline lock | Agency only |
| White-label PDF | Inline lock | Agency only |
| Public API (V2) | Inline lock | Pro+ |

---

## Suggested referral system (cheat sheet)

- Code: `?ref=username` (kebab-case username from email).
- Cookie: 30 days.
- Reward: 1 free month for both, on paid conversion.
- Stacking: unlimited.
- UI: `/app/referrals` page with code, share buttons, conversion list, banked months.
- Email: dispatched on conversion to both parties.

---

## Suggested affiliate system (cheat sheet)

- Apply at `/affiliates/apply` (manual approval).
- Code: `?aff=handle`.
- Cookie: 60 days; last-click attribution.
- Commission: 30% recurring for 12 months.
- Payout: monthly via PayPal/Razorpay payout, $50 minimum.
- Anti-fraud: refunds reverse commission; self-referral blocked.
