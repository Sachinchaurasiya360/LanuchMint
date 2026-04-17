# LaunchMint — Product Requirements Document

**Version:** 1.0
**Status:** Draft for Engineering Kickoff
**Owner:** Founding Team
**Last Updated:** 2026-04-17
**Tagline:** Turn visibility into velocity.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Problem Statement](#3-problem-statement)
4. [Market Opportunity](#4-market-opportunity)
5. [User Personas](#5-user-personas)
6. [User Pain Points](#6-user-pain-points)
7. [User Stories](#7-user-stories)
8. [User Flows](#8-user-flows)
9. [Feature Prioritization](#9-feature-prioritization)
10. [MVP Scope](#10-mvp-scope)
11. [V1 Scope](#11-v1-scope)
12. [V2 Scope](#12-v2-scope)
13. [Technical Architecture](#13-technical-architecture)
14. [Recommended Tech Stack](#14-recommended-tech-stack)
15. [Database Schema](#15-database-schema-summary)
16. [API Design](#16-api-design-summary)
17. [Authentication & Authorization](#17-authentication--authorization)
18. [RBAC Structure](#18-rbac-structure)
19. [Dashboard Structure](#19-dashboard-structure)
20. [SEO Strategy](#20-seo-strategy)
21. [AI Strategy](#21-ai-strategy)
22. [Monetization Strategy](#22-monetization-strategy)
23. [Marketing Strategy](#23-marketing-strategy)
24. [Community Strategy](#24-community-strategy)
25. [Growth Loops](#25-growth-loops)
26. [Launch Strategy](#26-launch-strategy)
27. [Risks](#27-risks)
28. [Success Metrics](#28-success-metrics)
29. [Roadmap](#29-roadmap)
30. [README Structure](#30-readme-structure)

---

## 1. Executive Summary

LaunchMint is a SEO-first, web-based platform that consolidates the workflows founders run across 8+ disconnected tools — Product Hunt (launches), Peerlist (founder identity), Trustpilot/G2 (reviews), RankInPublic (directory submissions), Ahrefs (SEO/backlinks), Indie Hackers (founder journey + MRR) — into a single dashboard with an AI assistant powered by Google Gemini.

**Core value proposition:** A solo SaaS founder can launch a product, collect verified reviews, submit to 200+ startup directories, track SEO/backlinks, showcase verified MRR, and build a public founder identity — all from one place, with Gemini automating the repetitive work (descriptions, meta tags, social posts, cold emails, review replies).

**Why now:**
- Product Hunt has degraded into a vote-trading game with poor SEO value.
- Ahrefs/SEMrush price out solo founders ($99–$449/mo).
- Directory submission is still manually copy-pasted across 100+ sites.
- Trust signals (reviews, MRR, backlinks) are scattered across silos.

**Business model:** Freemium SaaS. Free tier acquires founders → SEO and AI usage caps drive conversion to paid tiers ($29 / $79 / $149 / $299 per month).

**Geography:** Global from day one. Web-only. Bootstrapped.

**Stack:** Next.js + Node.js + PostgreSQL + Prisma + Gemini + BullMQ + S3 + Resend + Razorpay. Single-region single-database deploy on AWS via Docker Compose (no Kubernetes). Multi-tenant via row-level scoping.

**Brand:** White and yellow. No gradients. No emojis. Standard icons (Lucide). Optimized for both desktop and mobile.

---

## 2. Product Vision

> **Become the default operating system for the first 1,000 days of a startup's public life.**

By 2028, when a founder ships a product, the workflow should be: build → launch on LaunchMint → grow on LaunchMint. Every external tool a founder reaches for in the first 3 years (directory list, SEO checker, review widget, MRR tracker, founder bio, comparison page) lives natively here.

We win when:
- "Launch on LaunchMint" replaces "Launch on Product Hunt" in the indie founder vocabulary.
- Founder profile URLs (`launchmint.com/founder/yourname`) replace Linktree as the founder's canonical identity.
- LaunchMint's product pages outrank G2 and Capterra for `[product-name] reviews` and `[product-name] alternatives` queries.
- The platform itself is the largest single source of structured startup data on the open web.

---

## 3. Problem Statement

**Solo founders and small teams are forced to juggle 8+ tools to gain public visibility, each with high friction and weak compounding value.**

| Pain | Current Workaround | Cost |
|------|--------------------|------|
| Launching a product | Product Hunt (one-day window, dies after) | Free, but no SEO compounding |
| Collecting reviews | Trustpilot ($259/mo), G2 ($enterprise) | $250+/mo, slow approval |
| Tracking SEO | Ahrefs ($99–$449/mo), SEMrush ($139+) | $100+/mo, overkill for early founders |
| Backlink monitoring | Ahrefs, Moz | Bundled with above |
| Submitting to directories | Manual copy-paste across 100+ sites | 20–40 hours per launch |
| Founder identity | Linktree + Twitter + Peerlist + LinkedIn | Fragmented, no SEO ownership |
| Showing MRR/growth | Indie Hackers, Twitter screenshots | Self-reported, not verified |
| Generating launch copy | ChatGPT (manual prompting) | Context lost, inconsistent |

**Combined cost for a solo founder doing this seriously:** $400–$700/month + 40+ hours per launch. Most skip half of it and underperform.

**LaunchMint's wedge:** One subscription ($29–$149/mo), one dashboard, AI-automated busywork, and SEO-compounded permanent value (each launch leaves behind crawlable, schema-marked-up pages that earn organic traffic for years).

---

## 4. Market Opportunity

### TAM / SAM / SOM

- **TAM:** Global creators of new software products. ~5M active SaaS/indie projects worldwide; ~25M developers shipping side projects annually (GitHub data). Combined adjacent market (SEO tools + review platforms + community) > $20B.
- **SAM:** Solo SaaS founders, indie hackers, small SaaS teams (1–10 people), and boutique agencies. Estimated 1.5M globally, ~$3B annual spend on the categories LaunchMint replaces.
- **SOM (3-year):** 50,000 paying users × $60 ARPU/month = $36M ARR ceiling. Realistic year-3 target: 5,000 paid → $3.6M ARR.

### Competitive landscape

| Competitor | What they do | Where they fail |
|------------|--------------|-----------------|
| Product Hunt | Daily launches | One-day window; SF bias; no SEO; vote gaming |
| Peerlist | Founder identity | No launch infra, no SEO, no reviews |
| Trustpilot / G2 | Reviews | Expensive, slow, B2B-heavy |
| Ahrefs / SEMrush | SEO data | $100+/mo, overkill, not founder-shaped |
| RankInPublic / Submithunt | Directory submission | Single-purpose, not integrated with anything |
| Indie Hackers | Community + MRR self-report | No tooling, declining engagement |
| BetaList / MicroLaunch | Pre-launch waitlists | Single-feature |
| SaaSHub | Comparison pages | Read-only, founders can't claim |

**Unique angle:** No competitor combines launch + reviews + SEO + directory + MRR + founder identity + AI. The integration itself is the moat — each module produces data (reviews, backlinks, MRR) that feeds the others.

### Why bootstrap-friendly

- Programmatic SEO scales reach without paid acquisition.
- AI (Gemini) keeps unit economics positive even at low ARPU.
- Single-region, single-DB infra keeps costs under $500/mo until ~10k users.
- User-generated content (reviews, profiles) is the primary growth engine.

---

## 5. User Personas

### P1 — Priya, the Solo SaaS Founder *(Day-One ICP)*

- 28, technical, building a B2B SaaS solo from Bangalore, working nights/weekends.
- $0–$2k MRR. Wants more eyeballs, signups, backlinks.
- Stack: Twitter/X audience of 800, ProductHunt account, Stripe.
- Spends weekends submitting to directories, writing tweets, replying to reviews.
- **Pain:** No time for SEO. Doesn't know what's working. Can't afford Ahrefs.
- **Win for her:** "I launched, got 47 directories submitted in 2 hours, my product page ranks for `[my-niche] tool` in 60 days, I have a public founder profile that recruiters and angels actually visit."

### P2 — Marco, the Indie Hacker / Bootstrapper

- 35, multi-product portfolio (3 micro-SaaS), $8k MRR.
- Active on Indie Hackers, X, has a personal blog.
- **Pain:** Maintaining 3 separate "stacks" for 3 products. Wants one dashboard.
- **Win:** Multi-product workspace. Public MRR widget pulled from Stripe. Cross-promotes between his own products.

### P3 — Lena, the Marketing Manager at a 12-person SaaS

- Manages launches, SEO, reviews for the whole product.
- Reports to founder/CEO weekly with a deck.
- **Pain:** Stitching reports from Ahrefs + Trustpilot + ProductHunt into a deck.
- **Win:** One PDF export. Team dashboard. Role-based access for the dev team.

### P4 — Raj, the Agency Owner (5–10 client SaaS startups)

- Runs growth-as-a-service for 6 SaaS clients.
- Bills $2k–$5k/mo per client.
- **Pain:** Buying 6 Ahrefs seats, 6 Trustpilot subscriptions; each client's data siloed.
- **Win:** Agency plan with white-label dashboards, client switcher, exportable reports for each client.

### P5 — Anika, the Angel Investor

- Reviews 30 startups/month. Looks for traction signals.
- **Pain:** No standardized place to compare two early-stage startups.
- **Win:** Investor view. Filter by MRR / reviews / launch traction. Save shortlist.

### P6 — Devon, the Developer Submitting a Side Project

- Ships an open-source tool, wants visibility.
- **Pain:** Doesn't want to fill out 50 forms.
- **Win:** AI-assisted directory submission — fills the 50 forms automatically.

### P7 — Sara, the Buyer Researching a Tool

- Searches "best email marketing tool for SaaS" on Google.
- Lands on a LaunchMint comparison page.
- **Pain:** G2 is gamed. Capterra is sales-heavy.
- **Win:** Authentic founder responses, verified reviews, MRR transparency.

---

## 6. User Pain Points

Mapped 1:1 to platform modules. Each pain has a corresponding feature in the [MVP Scope](#10-mvp-scope).

| # | Pain | Persona | Module |
|---|------|---------|--------|
| 1 | "My Product Hunt launch died after 24 hours." | P1, P2 | Launch Pages (evergreen, indexable) |
| 2 | "I spent 3 weekends submitting to directories." | P1, P6 | AI-assisted Directory Submission |
| 3 | "Ahrefs is $99/mo, I need just the basics." | P1 | SEO Lite Dashboard |
| 4 | "My founder profile is split across 4 sites." | P1, P2 | Founder Profile Hub |
| 5 | "Can't tell my MRR story without screenshots." | P2 | Verified MRR widget (Stripe API) |
| 6 | "Reviews on Trustpilot are slow and expensive." | P3 | Review system + verified badges |
| 7 | "Don't know which competitors I'm losing to." | P3, P1 | Competitor SEO comparison |
| 8 | "Writing launch copy from scratch every time." | P1, P2 | Gemini AI generation suite |
| 9 | "Can't show clients a single dashboard." | P4 | Agency / white-label dashboard |
| 10 | "No way to quickly compare two SaaS." | P5, P7 | Auto-generated comparison pages |
| 11 | "Cold-emailing journalists takes hours." | P1 | AI cold email generator |
| 12 | "I'm not sure when I'm 'ready' to launch." | P1 | Launch Readiness Score (AI) |
| 13 | "Reviews can be faked, I don't trust the score." | P7 | Fake review detection + verified badges |
| 14 | "I have no idea who's linking to my site." | P1, P3 | Backlink monitor |
| 15 | "I want angel investors to find me." | P1 | Searchable founder + MRR profiles |

---

## 7. User Stories

Format: **As [persona], I want [outcome] so that [value].**

### Onboarding
- As P1, I want to sign in with Google in one click so that I'm in the dashboard within 30 seconds.
- As P1, I want a guided 6-step setup so that my first product is launch-ready before I exit onboarding.
- As P1, I want LaunchMint to scrape my landing page and prefill my product profile so that I don't retype anything.

### Launching
- As P1, I want to schedule my launch for a specific date so that I can coordinate social posts.
- As P1, I want a Launch Readiness Score before I publish so that I don't launch a half-baked listing.
- As P1, I want my launch page to remain a permanent SEO-indexed page after launch day so that traffic compounds.
- As P2, I want to launch a second product without re-creating my founder profile so that switching is frictionless.

### Reviews & Trust
- As P1, I want to invite my customers via email/link to leave a review so that I can build social proof.
- As P3, I want Trustpilot-style verified badges so that buyers trust the score.
- As P1, I want to reply to every review (including negatives) so that I demonstrate responsiveness.
- As P7, I want to filter for "verified customer" reviews only so that I avoid fakes.

### SEO & Backlinks
- As P1, I want a weekly snapshot of my DR, backlinks, and keyword rankings so that I can see if my SEO is moving.
- As P3, I want to compare my domain against 3 competitors so that I know the gap to close.
- As P1, I want alerts when I gain or lose a backlink so that I can react fast.
- As P1, I want AI keyword suggestions based on my product description so that I don't have to brainstorm.

### Directory Submission
- As P6, I want to submit to 50+ directories from one interface so that I save 20 hours.
- As P1, I want AI to auto-prioritize directories by relevance × DR so that I focus on what matters.
- As P1, I want progress tracking per directory (submitted, accepted, rejected, live) so that I know what's done.

### Founder Profile
- As P1, I want a public profile at `launchmint.com/founder/priya` so that I have a single canonical identity.
- As P1, I want my profile to show all my products, MRR, and reviews so that recruiters and investors get the full picture.

### Agency
- As P4, I want a client switcher and per-client dashboards so that I can manage 10 clients in one workspace.
- As P4, I want white-label PDF exports with my logo so that I can send branded reports.

### Investor
- As P5, I want to filter founders by MRR, launch traction, and category so that I find dealflow.

---

## 8. User Flows

### Flow 1 — First-time founder onboarding (target: <5 min to first launch draft)

```
Land on / (landing page)
  → Click "Launch Your Product" CTA
  → Google OAuth (one click)
  → Onboarding Step 1: "What's your product URL?" (paste URL)
     → Backend scrapes meta, og:image, headlines via Cheerio
     → Gemini generates: name, tagline, description, category, keywords
  → Onboarding Step 2: "Confirm your founder details" (prefilled from Google)
     → Generates founder slug
  → Onboarding Step 3: "Choose your launch date" (today / scheduled)
  → Onboarding Step 4: "Connect Stripe for verified MRR?" (skip allowed)
  → Onboarding Step 5: "Pick directories to auto-submit to" (top 25 prefilled, AI-prioritized)
  → Onboarding Step 6: "Review your launch page" (live preview)
     → Shows Launch Readiness Score (out of 100) with checklist
  → Dashboard home with product card + next-action checklist
```

### Flow 2 — Launch day flow

```
Founder schedules launch for Date D
  → On D-3: System sends pre-launch checklist + AI-generated tweets/LinkedIn posts via Resend
  → On D-1: System reminds founder to invite supporters
  → On D 00:00 UTC (or founder's chosen TZ): Launch goes live
     → Product appears on /today leaderboard
     → Notifications fire to followers via Resend
     → Cron-fired tweet (if X is connected) and LinkedIn post (if connected)
  → Throughout D: Real-time-ish (60s polling) leaderboard updates
  → On D+1: Page becomes evergreen, indexed, schema.org/Product markup live
  → On D+7: AI-generated launch retrospective email + share-link to embed badge
```

### Flow 3 — Review collection flow

```
Founder → Dashboard → Reviews → "Invite reviewers"
  → Paste customer emails OR generate magic link
  → Resend dispatches email: "Priya is collecting reviews for ProductX"
  → Customer clicks → lands on /review/{token}
  → Verifies via email magic link (Resend) OR Google OAuth
  → Submits star rating + review text
  → AI fake-review classifier scores submission
     → If suspicious: queued for moderation
     → If clean: published with "verified customer" badge
  → Founder gets notification, can reply
  → Review feeds into product trust score, founder profile, comparison pages
```

### Flow 4 — SEO tracking flow

```
Founder adds domain to SEO Tracker
  → BullMQ schedules: daily DR check, weekly backlink crawl, weekly keyword rank check
  → Data sourced from DataForSEO API (Phase 1) — see [SEO.md](./SEO.md)
  → Dashboard shows: DR, organic traffic, top keywords, backlinks gained/lost, spam score
  → Weekly Resend digest: "+12 backlinks this week, 3 new ranking keywords"
  → Founder clicks "Compare with competitor" → adds competitor domain → side-by-side
```

### Flow 5 — Directory submission flow

```
Founder → Dashboard → Directory Submission
  → System loads directory database (200+ entries, scraped + curated)
  → AI prioritizes top 50 based on (relevance × DR × cost × niche match)
  → Founder bulk-selects → "Generate submissions"
     → Gemini generates per-directory custom description (form-field-aware)
  → For each directory:
     → If has API: auto-submit
     → If form-only: generate prefilled clipboard package + open directory in new tab
     → Track status: pending / submitted / live / rejected
  → Backlink monitor watches for live links → marks "live" automatically
```

### Flow 6 — Agency client flow

```
Agency owner (P4) → Workspace switcher → "+ Add client"
  → Invites client via email (Resend)
  → Client accepts → granted "Client" role with restricted permissions
  → Agency manages SEO, launches, reviews on client's behalf
  → "Generate report" → branded PDF with agency logo → email to client via Resend
```

---

## 9. Feature Prioritization

Using **MoSCoW + WSJF** (Weighted Shortest Job First). Each feature scored:
- **User Value (UV):** 1–10
- **Time Criticality (TC):** 1–10
- **Risk Reduction (RR):** 1–10
- **Job Size (JS):** 1–10 (smaller = faster)
- **WSJF = (UV + TC + RR) / JS**

**MUST (MVP — Weeks 1–8)**

| Feature | UV | TC | RR | JS | WSJF |
|---------|----|----|----|----|------|
| Google OAuth + RBAC core | 10 | 10 | 10 | 3 | 10.0 |
| Shared UI library (Tailwind + Shadcn) | 8 | 10 | 9 | 2 | 13.5 |
| Founder profile pages | 9 | 9 | 7 | 4 | 6.25 |
| Product launch pages (one-day format) | 10 | 10 | 8 | 5 | 5.6 |
| Daily leaderboard | 9 | 9 | 6 | 3 | 8.0 |
| Reviews + ratings + verified badges | 9 | 8 | 8 | 5 | 5.0 |
| Upvotes + comments + replies | 8 | 8 | 6 | 3 | 7.3 |
| Directory database (seeded with 200+) | 9 | 9 | 7 | 4 | 6.25 |
| AI directory description generator | 8 | 7 | 6 | 3 | 7.0 |
| SEO dashboard (DR, traffic, keywords, backlinks via DataForSEO) | 9 | 8 | 7 | 6 | 4.0 |
| AI launch readiness score | 8 | 7 | 6 | 3 | 7.0 |
| Verified MRR via Stripe API | 8 | 7 | 8 | 4 | 5.75 |
| Resend transactional emails | 8 | 9 | 8 | 2 | 12.5 |
| Razorpay billing | 9 | 8 | 9 | 5 | 5.2 |
| Admin moderation dashboard | 7 | 8 | 9 | 4 | 6.0 |
| S3 file uploads (logo, screenshots) | 7 | 8 | 6 | 2 | 10.5 |
| Global search (Typesense) | 8 | 7 | 5 | 4 | 5.0 |
| Programmatic SEO pages (product / founder / category) | 9 | 9 | 7 | 5 | 5.0 |

**SHOULD (V1 — Weeks 9–16)**

| Feature | Why V1 not MVP |
|---------|----------------|
| Backlink change alerts | Needs SEO baseline data first |
| Competitor SEO comparison | Builds on SEO dashboard |
| AI cold email + social post generators | Convenience, not blocker |
| AI competitor summary | Builds on data |
| Team dashboards | Solo founder is ICP1 |
| Agency dashboard + white-label | Needs multi-tenant maturity |
| Public analytics widgets (embeddable JS) | Growth loop, post-PMF |
| Referral system | Needs paid base first |
| Affiliate system | Same |
| Exportable PDF/CSV reports | Polish on dashboards |
| Product Hunt badge embedding | Cross-promotion |
| DR badge embedding | Backlink farm for us |
| Notifications & alerts (in-app + email) | MVP has email only |

**COULD (V2 — Months 5–9)**

- Private communities, founder DMs, events/AMAs, job board, marketplace, public API, browser extension, AI landing page generation, multi-language, investor discovery, founder matchmaking, public roadmap pages, changelog pages, embeddable widgets v2, mobile app.

**WON'T (explicitly out of scope until proven demand)**

- Native iOS/Android apps before V2.
- Video reviews.
- AI agent that auto-launches without founder approval.
- Crypto/Web3 features.
- Real-time chat.

---

## 10. MVP Scope

**Goal:** Ship a usable product to the first 100 paying solo SaaS founders within 12 weeks.

**MVP must enable a single solo SaaS founder to:**
1. Sign up via Google.
2. Create a founder profile (public, SEO-indexed).
3. Create a product profile (public, SEO-indexed, dynamic).
4. Schedule and run a one-day launch.
5. Collect verified reviews with founder reply.
6. View a basic SEO dashboard (DR, backlinks, keywords).
7. Submit to a curated list of 50+ directories with AI-generated descriptions.
8. Connect Stripe to display verified MRR.
9. Get AI assistance for descriptions, meta tags, social posts, launch readiness.
10. Pay for upgrade via Razorpay.

### MVP feature list (final)

**Auth & Core**
- Google OAuth (NextAuth)
- User table, session management
- RBAC: Admin, Founder, Investor, Agency, Team Member, Client, Moderator (gates checked but only Admin + Founder fully active in MVP)
- Multi-tenant via `workspace_id` foreign key on every tenant-scoped row
- Single PostgreSQL DB with row-level workspace scoping

**Shared Foundation (built FIRST per DRY mandate)**
- `@launchmint/ui` shared component library (buttons, forms, cards, tables, modals — Shadcn-based)
- `@launchmint/db` Prisma client wrapper with workspace scoping helpers
- `@launchmint/auth` shared auth middleware
- `@launchmint/ai` Gemini wrapper with prompt templates, retry, cost tracking
- `@launchmint/email` Resend wrapper with templates
- `@launchmint/queue` BullMQ wrapper with job definitions
- `@launchmint/seo-meta` meta tag + JSON-LD generator
- `@launchmint/storage` S3 wrapper

**Public Pages (SEO-first)**
- `/` Landing page
- `/today` Daily launch leaderboard
- `/launches/[date]` Historical leaderboards
- `/products/[slug]` Product page (dynamic, evergreen, schema.org/Product)
- `/founders/[slug]` Founder profile (schema.org/Person)
- `/directories` Directory database
- `/directories/[slug]` Individual directory page
- `/categories/[slug]` Category page
- `/compare/[slugA]-vs-[slugB]` Auto-generated comparison
- `/best/[category]` Best-of pages

**Dashboard (authenticated)**
- `/app` Home (next-action checklist)
- `/app/products` Product list + create
- `/app/products/[id]` Product editor
- `/app/launches` Launch scheduler
- `/app/reviews` Review inbox + invite
- `/app/seo` SEO dashboard
- `/app/directories` Directory submission flow
- `/app/profile` Founder profile editor
- `/app/billing` Razorpay subscription
- `/app/settings` Workspace settings

**AI (Gemini)**
- Product description generator
- Directory submission description generator (per-directory tone)
- Meta title + description generator
- Launch readiness scorer
- Keyword suggestions
- Social post generator (X, LinkedIn)

**Reviews**
- Review collection via magic link (Resend)
- Verified customer badges (email-based proof)
- AI fake-review classifier (Gemini scoring of text + metadata)
- Founder reply system

**SEO Module (DataForSEO API as Phase 1 source)**
- Daily DR snapshot
- Weekly backlink list (top 100)
- Weekly keyword ranking (top 50 keywords)
- Organic traffic estimate
- Spam score
- Indexed pages count

**Directory Submission**
- Curated DB of 200+ directories at launch
- AI prioritization (relevance × DR)
- Per-directory description generation
- Status tracking (pending → submitted → live → rejected)
- Backlink confirmation via crawl

**Verified MRR**
- Stripe OAuth (read-only)
- Pull MRR via Stripe API daily
- Public widget on product + founder profile

**Billing**
- Razorpay subscription
- 4 paid tiers + free
- Usage metering (AI credits, SEO checks, directory submissions)
- Resend payment receipts

**Admin**
- Moderation queue (suspect reviews, flagged products, suspect founders)
- User management
- Manual badge issuance
- Audit log

**Email (Resend) — every event**
- Welcome
- Launch reminder (D-3, D-1)
- Launch live
- Review received
- Review replied
- Weekly SEO digest
- Backlink gained/lost (V1)
- Billing receipts
- Password reset (for non-OAuth fallback if added later)

**MVP exclusions:**
- No team dashboards (solo founder ICP)
- No white-label / agency
- No referral / affiliate
- No browser extension
- No public API
- No mobile app
- No private communities

---

## 11. V1 Scope (Weeks 9–16)

After MVP ships and we have 100+ paying founders, V1 adds:

- **Backlink change alerts** (gained/lost notifications)
- **Competitor SEO comparison** (3-way side-by-side)
- **AI cold email generator** (journalists, partners, customers)
- **AI competitor summary** (auto-pull competitor reviews + position)
- **Team dashboards** (multi-seat workspaces)
- **Agency dashboard + client switcher**
- **White-label PDF/CSV exports**
- **Embeddable badges:** Product Hunt-style, DR badge, Verified MRR badge, Review widget
- **Notifications center** (in-app bell)
- **Referral system:** Founder gets 1 free month per paying referral
- **Affiliate system:** 30% recurring for 12 months
- **Public analytics widgets** (embeddable JS for product page traffic)
- **Programmatic SEO expansion:** Industry pages, Alternatives pages, City pages, Country pages

---

## 12. V2 Scope (Months 5–9)

- Private communities (per-workspace forums)
- Founder DMs (with rate-limit + spam guard)
- Events & AMAs (calendar + recordings)
- Job board (founders post, talent applies)
- Marketplace for services (designers, devs, marketers)
- Public REST API (rate-limited, OAuth)
- Browser extension (one-click submit + review collection)
- AI landing page generation (drag-drop builder)
- Multi-language (i18n: ES, FR, DE, JA, HI initially)
- Investor discovery system
- Founder matchmaking (cofounder finder)
- Public roadmap pages per product
- Changelog pages per product
- Embedded widgets v2 (more types, customizable)
- Mobile app (React Native, V2.5)

---

## 13. Technical Architecture

### High-level

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare CDN (cache)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │  Next.js (SSR)  │  Vercel OR EC2 (Docker)
                  │  + API Routes   │
                  └────────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐      ┌─────▼─────┐     ┌─────▼─────┐
   │ Postgres │      │   Redis   │     │ Typesense │
   │  (RDS)   │      │ (BullMQ)  │     │  (search) │
   └──────────┘      └─────┬─────┘     └───────────┘
                           │
                  ┌────────▼────────┐
                  │  Worker (Node)  │  Docker on EC2
                  │  BullMQ workers │
                  └────────┬────────┘
                           │
        ┌──────────────────┼──────────────────┬─────────────┐
        │                  │                  │             │
   ┌────▼─────┐      ┌─────▼─────┐     ┌─────▼─────┐ ┌─────▼─────┐
   │  Gemini  │      │DataForSEO │     │  Resend   │ │  Stripe   │
   │   API    │      │    API    │     │   Email   │ │    API    │
   └──────────┘      └───────────┘     └───────────┘ └───────────┘
                           │
                     ┌─────▼─────┐
                     │  AWS S3   │
                     │ (uploads) │
                     └───────────┘
```

### Service breakdown

**1. Web (Next.js 14 App Router)**
- All pages SSR or ISR for SEO.
- Public pages: ISR with 60s revalidate.
- Dashboard pages: SSR with auth.
- API routes for all dashboard mutations (`/api/v1/*`).
- Edge runtime for read-only public endpoints.

**2. Worker (separate Node.js process)**
- Consumes BullMQ queues:
  - `seo-crawl` — daily DR + backlinks (DataForSEO calls)
  - `keyword-rank` — weekly ranking checks
  - `mrr-sync` — daily Stripe MRR pull
  - `directory-submit` — auto-submit jobs
  - `directory-verify` — backlink-live verification
  - `ai-generation` — Gemini calls (queued for cost batching)
  - `email-send` — Resend dispatches
  - `fake-review-scan` — Gemini classifier
  - `webhook-process` — Stripe / Razorpay webhooks
  - `scrape-meta` — onboarding URL scraping
  - `populate-directory-db` — admin-triggered scrape jobs

**3. Database (single PostgreSQL 16 on RDS)**
- Multi-tenant via `workspace_id` column.
- RLS policies disabled (app-level scoping for performance).
- Daily backups, 7-day PITR.
- Read replica added at ~10k DAU.

**4. Cache (Redis on ElastiCache)**
- Session storage
- BullMQ queue
- Rate limiting (express-rate-limit + Redis store)
- Hot cache (leaderboard, today's launches)

**5. Search (Typesense self-hosted on Docker)**
- Indexes: products, founders, directories, comparison pages
- Why Typesense over Elasticsearch: ~10x cheaper to run, simpler ops, faster to set up.

**6. File Storage (S3 + CloudFront)**
- Product logos, screenshots, founder avatars, agency white-label logos.
- Pre-signed URL uploads.
- Image optimization via Next/Image.

**7. CDN (Cloudflare)**
- Edge caching of public pages.
- DDoS protection, bot challenge for scrapers.

### Deployment

- **Single AWS region (us-east-1) at MVP.** No K8s. Docker Compose on a single EC2 (t3.large to start, scale vertical). Web split off to Vercel for SSR + edge if traffic warrants.
- **CI/CD:** GitHub Actions → Docker build → SSH deploy.
- **Monitoring:** PostHog (product analytics) + Sentry (errors) + Better Stack (uptime).
- **Secrets:** AWS Secrets Manager, never in env files committed.

### Scaling plan

| Stage | Users | Infra |
|-------|-------|-------|
| 0–1k | 1× t3.large EC2, 1× RDS db.t3.medium | $300/mo |
| 1k–10k | 2× t3.large EC2 (web + worker), RDS db.t3.large | $600/mo |
| 10k–50k | Vercel for web, 2× worker EC2, RDS db.m6g.large + read replica | $2k/mo |
| 50k+ | Add managed Kubernetes; introduce per-feature service split | $5k+/mo |

---

## 14. Recommended Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend framework | Next.js 14 (App Router) | SSR for SEO, ISR for programmatic pages, large ecosystem |
| Language | TypeScript everywhere | Type safety end-to-end |
| Styling | Tailwind CSS | Speed, consistency |
| Component lib | Shadcn/ui | Owned components, no lock-in, accessible |
| Icons | Lucide | Standard icon set, no emoji per brand mandate |
| Backend | Node.js 20 (Express within Next API routes; standalone Express for workers) | Single language across stack |
| ORM | Prisma 5 | Type-safe migrations, fast iteration |
| Database | PostgreSQL 16 (AWS RDS) | Reliable, JSON support, full-text |
| Cache + Queue | Redis 7 (ElastiCache) | Standard |
| Job runner | BullMQ | Mature, Redis-backed |
| Search | Typesense | Cheap, fast, founder-friendly DX |
| Auth | NextAuth.js (Google OAuth) | Battle-tested |
| AI | Google Gemini (1.5 Pro for reasoning, 1.5 Flash for cheap bulk) | Cost decision per founder |
| Email | Resend | Modern, dev-friendly, cheap, React Email templates |
| File storage | AWS S3 + CloudFront | Standard |
| Payments | Razorpay (primary) + Stripe (for verified MRR pull only, not billing) | India + global; Stripe used read-only |
| Analytics | PostHog (self-host or cloud) | Product analytics, feature flags, session replay |
| Error tracking | Sentry | Standard |
| SEO data source | DataForSEO API | Cheapest pay-as-you-go for backlinks + SERP |
| Web scraping | Cheerio + Playwright (for JS-heavy sites) | Onboarding meta scrape + directory scrape |
| Infrastructure | AWS EC2 + RDS + ElastiCache + S3, Docker Compose | No K8s, simple ops |
| CDN | Cloudflare | Free tier sufficient at MVP |
| CI/CD | GitHub Actions | Free for public, cheap for private |
| Monitoring | Better Stack uptime + Sentry + PostHog | Lean stack |

### Repo structure (monorepo via pnpm workspaces)

```
launchmint/
├── apps/
│   ├── web/              # Next.js 14 app
│   ├── worker/           # Standalone Node worker (BullMQ)
│   └── admin/            # (Optional) admin-only Next.js app, V1
├── packages/
│   ├── ui/               # Shared Shadcn components
│   ├── db/               # Prisma schema + client
│   ├── auth/             # NextAuth config + RBAC helpers
│   ├── ai/               # Gemini wrapper + prompts
│   ├── email/            # Resend templates + sender
│   ├── queue/            # BullMQ job definitions + producers
│   ├── seo-meta/         # JSON-LD + meta tag builders
│   ├── storage/          # S3 wrapper
│   ├── seo-data/         # DataForSEO wrapper
│   ├── billing/          # Razorpay + Stripe wrappers
│   ├── analytics/        # PostHog wrapper
│   ├── search/           # Typesense wrapper
│   └── config/           # Shared eslint, tsconfig, tailwind preset
├── docs/                 # PRD + supporting docs (this folder)
├── scripts/              # Seed + migration + scraper scripts
└── docker-compose.yml
```

**DRY mandate:** Every shared concern lives in `packages/`. App code in `apps/web` and `apps/worker` should never duplicate logic for AI, email, queueing, DB, storage, billing, search, or SEO meta. **Build the shared packages in Sprint 1 before any app feature.**

---

## 15. Database Schema (Summary)

Full schema in [DATABASE.md](./DATABASE.md). Summary of core entities:

| Entity | Purpose |
|--------|---------|
| `User` | Login identity (Google OAuth) |
| `Workspace` | Multi-tenant container |
| `WorkspaceMember` | User × Workspace + role |
| `Product` | A launchable product |
| `Launch` | A scheduled or completed launch event |
| `FounderProfile` | Public founder identity |
| `TeamProfile` | Public team listing |
| `Review` | Customer review of a product |
| `ReviewReply` | Founder reply to a review |
| `Comment` | Public comment on a product |
| `Upvote` | Vote on launch / product |
| `Directory` | A startup directory record |
| `DirectorySubmission` | Founder × Directory tracking row |
| `Backlink` | A discovered backlink |
| `KeywordRanking` | Tracked keyword + rank snapshot |
| `SeoSnapshot` | Daily/weekly DR + traffic snapshot |
| `MrrSnapshot` | Daily MRR pull from Stripe |
| `AiGeneration` | Audit log of all AI calls (cost tracking) |
| `Subscription` | Razorpay billing record |
| `UsageCounter` | Per-workspace usage (AI credits, SEO calls, etc.) |
| `Notification` | In-app notification (V1+) |
| `Referral` | Referral source tracking (V1+) |
| `Affiliate` | Affiliate payout record (V1+) |
| `AuditLog` | Admin actions audit |
| `Badge` | Verified / verified-customer / founder / etc. |

**Key design decisions:**
- Every tenant-scoped row carries `workspace_id`.
- Slugs (`product.slug`, `founder.slug`) are immutable after first publish to preserve SEO.
- Soft deletes via `deleted_at` on user-facing entities.
- `metadata JSONB` column on `Product`, `FounderProfile` for forward-compat.
- All AI generations stored in `AiGeneration` with prompt, response, token count, model, cost — used for billing and quality review.

---

## 16. API Design (Summary)

Full API spec in [API.md](./API.md). Conventions:

- REST, JSON, versioned `/api/v1/*`.
- Auth: Bearer JWT in `Authorization` header for first-party; cookie for browser.
- Standard responses: `{ data, error, meta }`.
- Pagination: cursor-based for lists.
- Rate limits: 60 rpm anonymous, 600 rpm authenticated, 6000 rpm Pro+.
- Webhooks signed with HMAC-SHA256.

**Surface (MVP):**

```
POST   /api/v1/auth/google                  Google OAuth callback
GET    /api/v1/me                            Current user + workspace

# Products
POST   /api/v1/products                      Create product
GET    /api/v1/products/:id                  Get product
PATCH  /api/v1/products/:id                  Update
DELETE /api/v1/products/:id                  Delete
POST   /api/v1/products/:id/scrape           AI scrape from URL

# Launches
POST   /api/v1/launches                      Schedule launch
GET    /api/v1/launches/today                Today's leaderboard
POST   /api/v1/launches/:id/upvote           Upvote
POST   /api/v1/launches/:id/comment          Comment

# Founder profile
GET    /api/v1/founders/:slug                Public founder profile
PATCH  /api/v1/founders/me                   Update own profile

# Reviews
POST   /api/v1/reviews/invite                Send review invite emails
POST   /api/v1/reviews                       Submit review (token gated)
GET    /api/v1/reviews?productId=            List reviews
POST   /api/v1/reviews/:id/reply             Founder reply

# SEO
POST   /api/v1/seo/domains                   Track a domain
GET    /api/v1/seo/snapshots?domain=         Snapshots
GET    /api/v1/seo/backlinks?domain=         Backlinks
GET    /api/v1/seo/keywords?domain=          Keywords

# Directories
GET    /api/v1/directories                   List directories
POST   /api/v1/directories/submit            Submit to directory
GET    /api/v1/directories/submissions       My submissions

# AI
POST   /api/v1/ai/generate                   Unified AI endpoint (type=description|meta|...)
GET    /api/v1/ai/usage                      My AI credit usage

# Billing
POST   /api/v1/billing/checkout              Razorpay checkout
POST   /api/v1/billing/portal                Customer portal
POST   /api/v1/billing/webhook               Razorpay webhook

# Stripe MRR
POST   /api/v1/integrations/stripe/connect   Stripe OAuth
GET    /api/v1/integrations/stripe/mrr       Current MRR

# Search
GET    /api/v1/search?q=                     Global search

# Admin
GET    /api/v1/admin/moderation/queue        Moderation queue
POST   /api/v1/admin/moderation/:id/decide   Approve/reject
```

---

## 17. Authentication & Authorization

- **Authentication:** Google OAuth via NextAuth.js. Email magic link as fallback (future).
- **Sessions:** JWT in HTTP-only cookie (web), Bearer JWT for API.
- **Workspace selection:** On login, user lands in their default workspace. Workspace switcher in nav.
- **Token refresh:** Sliding 30-day refresh.
- **Password:** None at MVP (OAuth only).
- **2FA:** V1 (TOTP).

### Authorization model

Role-based + workspace-scoped + resource-level.

```
permission = role.permissions ∩ workspace.scope ∩ resource.ownership
```

Every API handler invokes `authorize(user, workspace, resource, action)` before mutation.

---

## 18. RBAC Structure

| Role | Scope | Key Permissions |
|------|-------|-----------------|
| **SuperAdmin** | Global | Everything; moderation queue; user mgmt; impersonation |
| **Moderator** | Global | Review moderation, badge issuance, content takedown |
| **WorkspaceOwner** | Workspace | Manage members, billing, all resources |
| **Founder** | Workspace | Manage own products, founder profile, launches, reviews, SEO, directories |
| **TeamMember** | Workspace | Per-resource: view/edit products, view SEO; cannot manage billing or members |
| **Agency** | Workspace (parent) | Manage child workspaces (clients), white-label exports |
| **Client** | Workspace (child of Agency) | View own data, comment; cannot edit |
| **Investor** | Global (read-only enhanced) | Filter founders by MRR, save shortlist, contact (V2 DMs) |
| **Public** | None | View public pages only |

### Permission matrix (excerpt — MVP)

| Action | Owner | Founder | TeamMember | Agency | Client | Mod | Public |
|--------|:-----:|:-------:|:----------:|:------:|:------:|:---:|:------:|
| Create product | ✓ | ✓ | – | ✓ | – | – | – |
| Edit product | ✓ | ✓ | ✓ | ✓ | – | ✓ | – |
| Delete product | ✓ | ✓ | – | ✓ | – | ✓ | – |
| Reply to review | ✓ | ✓ | ✓ | ✓ | – | – | – |
| Submit to directory | ✓ | ✓ | ✓ | ✓ | – | – | – |
| View SEO dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | – | – |
| Manage billing | ✓ | – | – | ✓ | – | – | – |
| Invite team | ✓ | – | – | ✓ | – | – | – |
| Moderate | – | – | – | – | – | ✓ | – |
| Issue badge | – | – | – | – | – | ✓ | – |
| Impersonate | – | – | – | – | – | (super) | – |

Implementation: `packages/auth` exports `can(user, action, resource)` and `requirePermission(action)` middleware.

---

## 19. Dashboard Structure

### Top-level navigation (left sidebar, desktop)

```
[ Workspace switcher ]
─────────────────────
■ Home (next-action)
■ Products
■ Launches
■ Reviews
■ SEO
■ Backlinks
■ Directories
■ Founder Profile
─────────────────────
■ Team               (V1)
■ Agency / Clients   (V1, Agency role only)
■ Reports            (V1)
─────────────────────
■ Billing
■ Settings
```

Mobile: bottom tab bar with Home, Products, Reviews, SEO, More.

### Module sub-pages

- **Home:** Onboarding checklist (until 100% complete), then KPI summary cards (today's upvotes, new reviews, backlinks gained, MRR).
- **Products:** List → Detail (Overview / Launch / Reviews / SEO / Directories / Settings).
- **Launches:** Schedule + history + leaderboard preview.
- **Reviews:** Inbox (sortable by stars, status, verified) + Invite + Replies.
- **SEO:** Overview (DR, traffic, keywords, backlinks) + Keyword tracker + Backlink list + Competitor compare (V1).
- **Directories:** Database browser + My submissions + AI prioritization.
- **Founder Profile:** Editor + Public preview.
- **Team / Agency / Reports:** V1.
- **Billing:** Plan, invoices, usage meter.
- **Settings:** Workspace, integrations (Stripe, X, LinkedIn), API keys (V1).

---

## 20. SEO Strategy

**Detailed plan in [SEO.md](./SEO.md).** Summary:

LaunchMint **is** an SEO product, so its own SEO must be exemplary.

### Three-layer SEO plan

**Layer 1 — Foundation (every page)**
- Server-rendered HTML.
- Semantic markup (h1/h2/h3, article, section).
- JSON-LD per page type:
  - `Product` schema for product pages
  - `Person` schema for founder profiles
  - `Organization` schema for company pages
  - `Review` and `AggregateRating` for reviews
  - `BreadcrumbList` everywhere
  - `FAQPage` on FAQ-heavy pages
- Canonical URLs, OG + Twitter cards.
- XML sitemap, auto-generated, split (products, founders, directories, comparisons, categories).
- robots.txt + IndexNow ping for fresh URLs.
- Core Web Vitals: LCP < 2.0s, INP < 200ms, CLS < 0.1.

**Layer 2 — Programmatic SEO (millions of pages potential)**
- `/products/[slug]` — every product launched.
- `/founders/[slug]` — every founder.
- `/categories/[slug]` — e.g., `/categories/email-marketing`.
- `/industries/[slug]` — e.g., `/industries/healthtech`.
- `/directories/[slug]` — every directory in the DB.
- `/best/[category]` — best email marketing tools, refreshed weekly.
- `/compare/[a]-vs-[b]` — auto-generated when both products exist.
- `/alternatives/[product]` — e.g., `/alternatives/mailchimp`.
- `/[country]/startups` — e.g., `/india/startups`.
- `/[city]/startups` — e.g., `/bangalore/startups`.

**Quality gates (anti-thin-content):**
- Minimum 350 words of unique content per page (AI-generated where appropriate, human-reviewed for top categories).
- No empty comparison pages — both products must have ≥3 reviews each.
- No empty city pages — minimum 10 startups in city before page indexes.

**Layer 3 — Content marketing**
- 2–3 founder interviews per week (long-form).
- Weekly "indie traction report" (data we own).
- Tool-of-the-week deep dive.
- Open data reports (which directories give the best DR boost, etc.).

### SEO workflow per product launch
1. Founder publishes product → page goes live with ISR.
2. Sitemap updated within 60s; IndexNow pinged.
3. Internal links auto-injected: founder profile → product, category → product, comparison pages where applicable.
4. After 30 days, AI re-scores SEO completeness; founder gets nudge to fill gaps.

---

## 21. AI Strategy

**Model:** Google Gemini 1.5 Pro (reasoning) and Gemini 1.5 Flash (bulk/cheap). All AI through `packages/ai`.

### Use cases (MVP)

| Feature | Model | Trigger | Cost guard |
|---------|-------|---------|------------|
| Product description | Flash | Onboarding + manual regen | 1 credit |
| Directory description (per-directory) | Flash | Directory submission | 1 credit / directory |
| Meta title + description | Flash | On product save | 0.5 credit |
| SEO suggestions | Pro | On-demand | 3 credits |
| Cold email | Flash | On-demand | 1 credit |
| Social posts (X, LinkedIn) | Flash | Pre-launch + on-demand | 1 credit |
| Launch posts (long-form) | Pro | Pre-launch | 3 credits |
| Review reply suggestions | Flash | Per review | 1 credit |
| Competitor summary | Pro | On-demand | 5 credits |
| Founder profile summary | Flash | Profile completion | 1 credit |
| Launch readiness score | Pro | On product save | 3 credits |
| Keyword recommendations | Pro | SEO dashboard load | 3 credits / week |
| Directory prioritization | Flash | On directory page load | 2 credits |
| Fake-review classifier | Flash | Per review submission (system) | Free to user |

### Credit system

- 1 credit ≈ 1 Flash call, 0.3 Pro call (we absorb the math; users see "credits").
- Free: 30 credits/mo
- Starter: 500 credits/mo
- Growth: 2,000 credits/mo
- Pro: 10,000 credits/mo
- Agency: 30,000 credits/mo (pooled across clients)

### AI safety

- All AI output is **suggested**, never auto-published. Founder approves before publish.
- All AI generations logged to `AiGeneration` table with prompt + response + token count.
- Prompt-injection guard via input length cap + suspicious pattern filter.
- Output run through profanity + brand safety filter before display.
- Cost ceiling per workspace per day; soft block at 90%, hard block at 100%.

### Prompt management

- All prompts versioned in `packages/ai/prompts/*.ts`.
- A/B testable via PostHog feature flags.
- Includes few-shot examples for consistency.

---

## 22. Monetization Strategy

**Detailed in [MONETIZATION.md](./MONETIZATION.md).**

### Pricing tiers (revised from original — recommended)

> **Note on pricing:** The original brief specified $69/$149/$199. Recommended adjustment: introduce a $29 Starter to capture solo founders who'd otherwise stay on Free, and lift Agency to $299 for a clearer ladder. Final pricing decision is the founder's; spec below assumes the recommended structure.

| Plan | Price | Target | AI credits/mo | SEO domains | Directory submissions/mo | Team seats | White-label |
|------|-------|--------|---------------|-------------|--------------------------|------------|-------------|
| **Free** | $0 | Trial / hobby | 30 | 1 | 5 | 1 | – |
| **Starter** | $29/mo or $290/yr | Solo founder | 500 | 2 | 50 | 1 | – |
| **Growth** | $79/mo or $790/yr | Small team | 2,000 | 5 | 200 | 5 | – |
| **Pro** | $149/mo or $1,490/yr | Power founder / SMB | 10,000 | 15 | unlimited | 10 | – |
| **Agency** | $299/mo or $2,990/yr | Agency reselling | 30,000 (pooled) | 50 (pooled) | unlimited | 25 | ✓ |

Annual = 2 months free.

### Free plan limitations
- Launch is permanent but only 1 product.
- SEO data refresh weekly (not daily).
- No verified MRR widget.
- LaunchMint badge required on product page.
- AI suggestions limited to 30 credits/mo.
- 5 directory submissions/mo.
- No team members.
- No CSV / PDF export.

### Usage limits & overage
- AI credits: hard cap; buy 1,000 extra for $10.
- SEO domains: hard cap; upgrade to add more.
- Directory submissions: hard cap; upgrade to add more.
- Reviews: unlimited on all plans (incl. free) — virality > revenue here.

### Revenue projection (conservative)

| Month | Free users | Paid users | MRR |
|-------|-----------:|-----------:|----:|
| M3 (MVP launch) | 500 | 30 | $1,500 |
| M6 | 2,500 | 150 | $9,000 |
| M12 | 12,000 | 800 | $50,000 |
| M24 | 50,000 | 3,500 | $220,000 |

ARPU target $60–$70 (heavy mix of Starter + Growth).

### Why Razorpay (not Stripe billing)
- India-friendly (zero-friction INR, UPI).
- Global card support adequate for Phase 1.
- Stripe used **read-only** to pull MRR for verified MRR widget — not for billing.
- Switch to Stripe Billing as primary processor reconsidered at Month 12 if US/EU paid mix > 60%.

---

## 23. Marketing Strategy

**Detailed in [MARKETING.md](./MARKETING.md).** Summary:

### Phase 1 — Pre-launch (Weeks -4 to 0)
- Founder builds in public on X + LinkedIn (founder has existing audience).
- Waitlist landing page with copy: "The all-in-one launch, SEO, review, backlink, founder identity, and startup growth platform."
- Lead-magnet: "Free directory list of 200+ startup directories" → email capture via Resend.
- Pre-launch design partner program: 20 founders get free Pro for 6 months in exchange for testimonial + case study.

### Phase 2 — Launch (Week 0 — MVP ship)
- Product Hunt launch (yes — eat our own first, then move).
- Tweetstorm + LinkedIn long-form from founder.
- Email blast to waitlist.
- 10 podcast appearances in indie founder space (Indie Hackers, This Week in Startups, etc.) booked via PR push.
- "Hot take" content: "We rebuilt Product Hunt for SEO."

### Phase 3 — Growth (Months 1–6)
- Programmatic SEO — primary moat.
- Content engine: 2 founder interviews/week; weekly indie traction report; data-driven posts ("we analyzed 1,000 launches and here's what predicts success").
- Referral program ($30 cash or 1 free month per paid referral).
- Affiliate program (30% recurring for 12 months).
- Cross-promotion via embeddable badges on customer sites (link back, free DR).

### Channels (priority order)
1. **Organic SEO** (long-term moat, programmatic + content)
2. **X / Twitter** (founder-led, daily)
3. **LinkedIn** (B2B founders, weekly long-form)
4. **Indie Hackers + Reddit** (community participation)
5. **Podcasts** (PR-driven, monthly)
6. **YouTube** (tutorial channel — "How to launch your SaaS" — Month 4+)
7. **Paid** (only after CAC validated; Google Ads on `[competitor] alternative` queries)

### Marketing pages (must exist at MVP)
- `/` Landing
- `/launch` Launch feature deep-dive
- `/seo` SEO feature deep-dive
- `/reviews` Reviews feature deep-dive
- `/directories` Directory feature deep-dive
- `/founder-profiles` Founder profile feature
- `/agencies` Agency landing
- `/pricing`
- `/compare/[us]-vs-[competitor]` (we vs Product Hunt, Trustpilot, Ahrefs)
- `/use-cases/saas-founders`
- `/use-cases/indie-hackers`
- `/use-cases/agencies`
- `/use-cases/investors`
- `/blog`
- `/changelog`
- `/about`
- `/privacy`, `/terms`, `/security`

---

## 24. Community Strategy

Community is **important** (per founder direction) but not at MVP — V2 ships private communities.

**MVP community surface:**
- Public comments on launch pages.
- Founder reply system.
- Public founder profiles (the "social graph" begins here).
- Daily leaderboard with social proof (upvotes, comments).

**V1 additions:**
- Founder follow (notify on new launches).
- Profile activity feed (public).

**V2 — full community:**
- Per-workspace private communities.
- Founder DMs.
- AMAs.
- Cofounder matchmaking.
- Investor connect.

**Anti-toxicity rules from day one:**
- No anonymous comments (Google account required).
- AI moderation on every comment (Gemini classifier — toxicity, spam, ad).
- Three-strike auto-suspend.
- Founders can hide (not delete) comments on their pages with public reason.

**Moderation workflow:**
1. AI flags suspect content → moderation queue.
2. Moderator (or super admin) reviews within 24h.
3. Decision logged to `AuditLog`.
4. User notified via Resend.

---

## 25. Growth Loops

LaunchMint compounds value via **5 self-reinforcing loops**:

### Loop 1 — Programmatic SEO loop
```
Founder launches → product page indexed → founder shares → backlinks → DR rises → all our pages rank higher → more organic traffic → more launches
```

### Loop 2 — Embeddable badge loop
```
Founder embeds "Featured on LaunchMint" badge on their site → backlinks to us → founder's customers see badge → click through → become users → embed badges
```

### Loop 3 — Review collection loop
```
Founder invites customers to review → customers create accounts → discover other products → become customers themselves → their founders invite them again
```

### Loop 4 — Comparison page loop
```
Founder A claims product → comparison pages auto-generated against competitors → comparison pages rank for `[A] vs [B]` queries → competitor B sees their listing → claims their listing → invites their reviewers → loop expands
```

### Loop 5 — Referral loop (V1)
```
Paid founder refers peer founder → both get 1 free month → both invest more → both refer more
```

---

## 26. Launch Strategy

### Pre-launch (Weeks -8 to 0)
- Build in public daily on X.
- Waitlist with directory PDF lead magnet.
- 20 design partners locked in.
- 50 directories pre-curated and seeded in DB.
- 100 founder profiles pre-scraped from public sources (with opt-out flow on first sign-in).

### Launch day (T0)
- Soft launch to waitlist 24h prior.
- 06:00 UTC — public launch.
- 09:00 UTC — Product Hunt launch (LaunchMint launches on Product Hunt for the irony and traffic).
- 10:00 UTC — Tweetstorm + LinkedIn long-form.
- 12:00 UTC — Email blast.
- 14:00–22:00 UTC — Founder lives in comments, replies to every PH comment.
- Ride momentum into Hacker News (Show HN) within 48h.

### Launch checklist (founder-facing — used inside the app and at our own launch)
- [ ] Product name, tagline, 1-line + 3-paragraph descriptions
- [ ] Logo (square, 256×256 min)
- [ ] At least 3 screenshots OR 1 demo video
- [ ] Category tagged
- [ ] Founder profile complete (avatar, bio, social links)
- [ ] Launch readiness score ≥ 80
- [ ] Pricing page on product
- [ ] First 5 reviewers lined up (email list)
- [ ] Top 25 directories prepared
- [ ] X + LinkedIn drafts ready (AI-generated, founder-edited)
- [ ] Stripe connected for verified MRR (if applicable)
- [ ] Schema.org markup verified
- [ ] OG image generated

---

## 27. Risks

### Product risks

| Risk | Likelihood | Impact | Mitigation |
|------|:----------:|:------:|------------|
| Cold start: empty marketplace | High | High | Pre-seed 100 founder profiles + 200 directories before launch |
| Fake reviews / spam | High | High | AI classifier + verified-customer requirement + moderation queue |
| AI hallucination in descriptions | Med | Med | Founder approval required before publish; show source URL |
| Cost blowout from AI | Med | High | Per-workspace daily caps + Flash for bulk + queue batching |
| SEO penalty (programmatic = thin content risk) | Med | High | 350-word minimum, no empty pages, periodic crawl audit |
| Directory database goes stale | High | Med | Quarterly re-crawl job; user submissions allowed |
| Stripe MRR API breaking changes | Low | Med | Wrap in `packages/billing`, mock for tests |

### Business risks

| Risk | Likelihood | Impact | Mitigation |
|------|:----------:|:------:|------------|
| Product Hunt reacts (cuts API, etc.) | Low | Low | We don't depend on PH API; we replace it |
| Ahrefs / SEMrush price-drops to free | Low | High | We bundle 7 categories, not just SEO — defensible |
| Bootstrapping runway exhausted | Med | Critical | Charge from day one, free tier limits drive conversion |
| Razorpay India-only friction for US founders | Med | Med | Stripe-as-billing readiness in V1 if US mix > 40% |
| Lawsuit from a founder over a bad review | Med | Med | Clear ToS, takedown process, "verified customer" requirement |
| Scraping for directory DB creates legal exposure | Med | Med | Public data only; respect robots.txt; opt-out for any party |

### Technical risks

| Risk | Likelihood | Impact | Mitigation |
|------|:----------:|:------:|------------|
| DataForSEO API costs scale faster than revenue | High | High | Cache aggressively (24h DR, 7d backlinks); rate-limit free tier |
| Single-DB bottleneck at 50k users | Low (yet) | High | Read replica plan ready; tracked queries in PostHog |
| Gemini API outage | Low | Med | Queue-and-retry; fallback to cached responses; degrade gracefully |
| EC2 single-AZ outage | Med | Med | Multi-AZ RDS from day one; web behind CDN |

---

## 28. Success Metrics

### North Star Metric
**Weekly Active Founders Who Launched, Reviewed, or Submitted to a Directory** (WAF-LRD)

Captures the three core loops in one number. If this grows, the platform is alive.

### Tier-2 metrics (KPI dashboard, reviewed weekly)

**Acquisition**
- Signups / week
- Signup → activation rate (created first product within 7 days)
- Organic traffic (sessions / week)
- Top-10 ranking keywords count

**Activation**
- % users who launch a product within 7 days
- % users who collect ≥1 review within 14 days
- % users who submit to ≥10 directories within 30 days

**Retention**
- W1, W4, W12 retention curves
- % free → paid conversion within 30 days
- Net revenue retention (MRR cohort)

**Revenue**
- MRR
- ARPU
- LTV (rolling 6-mo cohort)
- CAC (when paid spend begins)

**Product engagement**
- AI credits used / paid user
- Reviews collected per product
- Directories submitted per product
- SEO dashboards opened / week

**Trust & quality**
- % verified reviews
- Fake-review false-positive rate
- Moderation queue resolution time (target < 24h)

**Cost**
- Gemini cost per active workspace
- DataForSEO cost per active workspace
- Total infra cost / paid user

### Suggested analytics events (PostHog)
```
user_signed_up
user_completed_onboarding
product_created
product_published
launch_scheduled
launch_went_live
review_invite_sent
review_submitted
review_replied
directory_selected
directory_submitted
directory_went_live
seo_dashboard_viewed
seo_competitor_added
backlink_alert_triggered
ai_generation_requested            { type, model, credits, latency_ms }
mrr_widget_connected
billing_checkout_started
billing_subscribed                 { plan }
billing_upgraded
billing_churned
referral_link_shared
referral_converted
agency_client_added
report_exported                    { format }
```

---

## 29. Roadmap

### 12-week sprint plan (MVP)

**Detail in [ROADMAP.md](./ROADMAP.md). Summary:**

- **Sprint 1 (W1–2):** Foundation — repo, packages (`ui`, `db`, `auth`, `ai`, `email`, `queue`, `storage`), Google OAuth, base layouts, brand system.
- **Sprint 2 (W3–4):** Founder profiles + Product CRUD + onboarding scrape flow + S3 uploads.
- **Sprint 3 (W5):** Launches + leaderboard + upvotes + comments.
- **Sprint 4 (W6):** Reviews + verified badges + AI fake-review classifier + founder reply.
- **Sprint 5 (W7):** Directory database + AI prioritization + submission tracking.
- **Sprint 6 (W8):** SEO dashboard (DataForSEO) + Stripe MRR widget + AI generation suite + Razorpay billing + global search.
- **Sprint 7 (W9):** Programmatic SEO pages + sitemap + IndexNow + landing pages + admin moderation dashboard.
- **Sprint 8 (W10):** Polish + bugs + perf + analytics events + email templates (Resend).
- **Sprint 9 (W11):** Beta with design partners.
- **Sprint 10 (W12):** Public launch.

### Quarter view

| Quarter | Focus |
|---------|-------|
| Q1 (M1–3) | MVP build + ship + first 100 paid |
| Q2 (M4–6) | V1 features (team, agency, badges, alerts) + 1k paid |
| Q3 (M7–9) | V2 begin — communities, DMs, public API + 3k paid |
| Q4 (M10–12) | Mobile app, multi-language, investor system + 5k paid |

---

## 30. README Structure

See [README.md](./README.md) for the full project README. Outline:

1. What is LaunchMint
2. Quick links (docs, design, status)
3. Tech stack
4. Repo structure
5. Local development
6. Environment variables
7. Database setup
8. Running tests
9. Deployment
10. Contributing
11. License

---

## Appendices

- [README.md](./README.md) — Engineering README
- [ROADMAP.md](./ROADMAP.md) — 12-week sprint plan + quarterly roadmap
- [DATABASE.md](./DATABASE.md) — Full Prisma schema
- [API.md](./API.md) — Full REST API reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture deep-dive
- [DESIGN.md](./DESIGN.md) — Brand system, UI library, page-by-page design notes
- [SEO.md](./SEO.md) — Programmatic SEO + content strategy
- [MONETIZATION.md](./MONETIZATION.md) — Pricing, billing, gating, referrals, affiliate
- [MARKETING.md](./MARKETING.md) — GTM, channels, page-by-page marketing site
- [ONBOARDING.md](./ONBOARDING.md) — Onboarding + launch checklist + analytics events

---

**End of PRD.**
