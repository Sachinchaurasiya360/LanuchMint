# LaunchMint — Marketing & Go-to-Market

This document defines positioning, messaging, marketing-site IA, channel strategy, and the launch playbook.

---

## Positioning

**Category:** Founder operating system (new category — defined here).

**Tagline:** Turn visibility into velocity.

**One-liner:** "The all-in-one launch, SEO, review, backlink, founder identity, and startup growth platform."

**Elevator (30s):** "LaunchMint replaces the eight tools founders juggle for visibility — Product Hunt, Trustpilot, Ahrefs, RankInPublic, Peerlist, Indie Hackers, G2, and the directory submission spreadsheet — with one dashboard. You launch, collect verified reviews, submit to 200+ directories, track SEO and backlinks, show verified MRR, and build a public founder identity. Gemini AI does the busywork. One subscription, $29 to $299 per month."

**Why us, why now:**
- Product Hunt launches die in 24 hours. We make them permanent SEO assets.
- Ahrefs is $99+ and overkill for early founders. We do the SEO basics for $29.
- Directory submission is still a 40-hour copy-paste. AI does it in 2 hours.
- Trust signals (reviews, MRR, backlinks) are scattered. We unify them on one founder profile that ranks.

---

## Messaging pillars (use across landing, ads, social)

| Pillar | Headline | Sub |
|--------|----------|-----|
| **Launch** | "Your launch shouldn't die in 24 hours." | "Permanent, indexable launch pages that compound traffic for years." |
| **Trust** | "Reviews you can actually trust." | "Verified-customer badges. AI-flagged fakes. Founder replies on every review." |
| **SEO** | "SEO without the $99/mo bill." | "DR, backlinks, keyword rankings, and competitor compares — built for founders, priced for founders." |
| **Directories** | "200+ directory submissions in 2 hours." | "AI prioritizes the highest-DR directories for your niche and writes the descriptions." |
| **Identity** | "Your canonical founder profile." | "One URL that ranks for your name. All your products, all your reviews, your verified MRR." |
| **MRR** | "Show MRR you didn't have to screenshot." | "Connect Stripe, prove your traction publicly with one click." |
| **AI** | "Gemini does the busywork." | "Descriptions, meta tags, social posts, cold emails, review replies — generated, not written." |

---

## Target ICPs by phase

| Phase | ICP | Why |
|-------|-----|-----|
| **Day 1 (Months 1–3)** | Solo SaaS founder, $0–$5k MRR, technical, has X audience | Highest empathy match, we know their pain |
| **Phase 2 (Months 4–6)** | Indie hackers with 2–5 products | Need multi-product workspace |
| **Phase 3 (Months 7–9)** | Small SaaS teams (5–10 people) | Team seats unlock |
| **Phase 4 (Months 10–12)** | Agencies with 5+ SaaS clients | White-label unlock |
| **Phase 5 (Year 2)** | Mid-size SaaS, B2C app makers, AI tool builders, investors | Pro plan + investor module |

---

## Marketing-site information architecture

### Top nav (left → right)
- Logo
- Product (mega menu): Launch, Reviews, SEO, Backlinks, Directories, Founder Profile, MRR, AI
- Solutions (mega menu): For Solo Founders, For Indie Hackers, For Teams, For Agencies, For Investors
- Pricing
- Compare (dropdown): vs Product Hunt, vs Trustpilot, vs Ahrefs, vs G2
- Resources (dropdown): Blog, Indie Reports, Directory Database, Founder Interviews, Changelog
- Sign in
- Launch your product (yellow CTA)

### Pages required at MVP

**Conversion**
- `/` Landing
- `/pricing`
- `/launch` Launch feature
- `/reviews` Reviews feature
- `/seo` SEO feature
- `/directories` Directory feature
- `/founder-profiles` Identity feature
- `/mrr` Verified MRR feature
- `/ai` AI feature

**Solutions**
- `/use-cases/saas-founders`
- `/use-cases/indie-hackers`
- `/use-cases/teams`
- `/use-cases/agencies`
- `/use-cases/investors`

**Comparison (own the searches)**
- `/vs/product-hunt`
- `/vs/trustpilot`
- `/vs/ahrefs`
- `/vs/g2`
- `/vs/peerlist`
- `/vs/rankinpublic`
- `/vs/indie-hackers`

**Trust & legal**
- `/about`
- `/security`
- `/privacy`
- `/terms`
- `/dpa` (B2B data processing addendum)
- `/contact`

**Resources**
- `/blog` and `/blog/[slug]`
- `/changelog`
- `/directories` (programmatic — also a feature page)
- `/founders` (founder directory)
- `/today` (live leaderboard)

---

## Landing page (`/`) wireframe & copy

### Section 1 — Hero
- **H1:** Turn visibility into velocity.
- **Sub:** Launch your product, collect reviews, submit to 200+ directories, track SEO and backlinks, and own your founder identity — all in one dashboard.
- **Primary CTA (yellow):** Launch your product
- **Secondary CTA (ghost):** Discover startups
- **Below CTAs:** "No credit card. Free forever for 1 product."
- **Visual:** Product screenshot (dashboard home).

### Section 2 — Stat strip (live counters via API)
- X,XXX founders
- Y,XXX products launched
- Z,XXX reviews collected
- AAA,XXX directory submissions

### Section 3 — Problem framing (3-column)
- "Your Product Hunt launch dies in 24 hours."
- "Ahrefs costs $99/mo just for the basics."
- "Directory submission still takes 40 hours."

### Section 4 — Feature blocks (alternating left/right, 6 blocks)
1. **Launch** — screenshot + bullets + "Learn more →"
2. **Reviews**
3. **SEO**
4. **Directories**
5. **Founder identity**
6. **AI assistant**

### Section 5 — Compare row
"Replace 8 tools with one." Logos crossed out → LaunchMint logo.

### Section 6 — Social proof
- 3 founder testimonials with avatar, name, product link.
- Trusted-by logo strip.

### Section 7 — Pricing teaser
- 3 cards (Free, Starter, Growth) with "See all plans →".

### Section 8 — FAQ
- 8–10 founder-empathetic questions:
  - "Is this a Product Hunt replacement?"
  - "How is this different from Ahrefs?"
  - "Can I trust the reviews?"
  - "Do I need to migrate from existing tools?"
  - "Is there a free plan?"
  - "Can I cancel anytime?"
  - "Do you support [my country / currency]?"
  - "How does the AI work?"

### Section 9 — Final CTA
- "Launch your product in under 5 minutes."
- Yellow CTA + "No credit card."

### Footer
- 5 columns: Product, Solutions, Compare, Resources, Company.
- Below: brand, copyright, social links, status, security.

---

## Channel strategy (priority)

### 1. Organic SEO (primary, long-term moat)
See [SEO.md](./SEO.md) for full strategy. Driver of free-tier signups.

### 2. Founder-led on X / Twitter
- Founder posts daily (existing audience as launchpad).
- Format mix: build-in-public, hot takes, data drops, founder interviews, mini-tutorials.
- Comment in adjacent threads (Indie Hackers, SaaS founder discourse).
- Pin a tweet about LaunchMint with launch CTA.

### 3. LinkedIn long-form
- 1 long-form post / week from founder (existing audience).
- Cross-post indie traction reports.
- Engage in agency owner communities.

### 4. Indie Hackers + Reddit
- Active commentary in `r/SaaS`, `r/indiehackers`, `r/startups`, `r/Entrepreneur`.
- Indie Hackers product page + monthly milestone updates.
- Avoid spam — value-add only.

### 5. Podcasts
- Goal: 10 podcast appearances in first 90 days.
- Targets: Indie Hackers, This Week in Startups, MFM, Startups for the Rest of Us, SaaStr.
- Pitch angle: "We're rebuilding Product Hunt for SEO."

### 6. YouTube
- Start at Month 4.
- Format: "How to launch your SaaS" tutorial series + product walkthroughs + founder interviews.
- 1 video / week.

### 7. Paid (only after CAC validated)
- Google Search: bid on `[competitor] alternative` queries.
- LinkedIn ads to indie founder lookalikes (when budget allows).
- Twitter ads experiment.

### 8. Partnerships
- Co-marketing with adjacent SaaS (form builders, no-code platforms, founder courses).
- Sponsorship of indie founder newsletters (Refind, This Week in Startups, etc.) starting Month 6.

---

## Launch playbook (LaunchMint's own launch)

### T-8 weeks
- Soft waitlist live. Lead magnet: PDF "200+ startup directories ranked by DR".
- Begin building in public on X daily.
- 20 design partners locked in (free Pro for 6 months in exchange for testimonial + case study).
- Press kit drafted.

### T-4 weeks
- Beta open to design partners.
- Daily X threads + 2 LinkedIn long-forms / week.
- Outreach to 30 SaaS bloggers / podcasters.
- 5 podcast bookings confirmed.

### T-1 week
- Final product polish.
- Press embargo set for T0 06:00 UTC.
- Email blast to waitlist scheduled.
- Twitter thread + LinkedIn post drafted.
- Product Hunt scheduled.

### T0 — Launch day
- 06:00 UTC: Site flips public; waitlist email blast.
- 09:00 UTC: Product Hunt launch live.
- 10:00 UTC: Twitter mega-thread + LinkedIn long-form.
- 11:00 UTC: Show HN post.
- 12:00 UTC: Indie Hackers milestone post.
- 14:00 UTC: Email to design partners requesting they publish testimonials + retweets.
- 15:00–22:00 UTC: Founder lives in PH/HN comments; replies to every comment.
- 18:00 UTC: Founder podcast episode airs (pre-recorded).

### T+1 to T+7
- Founder interview series: 1/day.
- Daily metrics share (radical transparency: "Day 1 signups, conversion, etc.").
- Press follow-ups.
- Bug-fix sprint.

### T+30
- 30-day retro post (data + lessons).
- First indie traction report based on platform data.
- First partnership announcement.

### T+90
- Major V1 feature drop (badges + alerts).
- Second launch wave (different tagline angle, different audience: agencies).

---

## Content calendar (first 90 days post-launch)

| Week | Theme | Posts (4–5/week) |
|------|-------|------------------|
| 1 | Launch | Launch retro, product tour video, founder Q&A, pricing logic |
| 2 | SEO | SEO for indie founders 101, our own SEO strategy, programmatic SEO ethics |
| 3 | Reviews | Why most reviews are fake, our verification system, case study |
| 4 | Directories | Top 50 directories ranked, the 40-hour problem, AI submission walkthrough |
| 5 | Founder identity | Why founder profiles matter, recruiter / investor perspective, case study |
| 6 | MRR | Verified MRR debate, how Stripe pull works, transparency case study |
| 7 | AI | How we use Gemini, prompts that work, AI ethics for founders |
| 8 | Data drop | "We analyzed 1,000 launches" |
| 9 | Comparison | LaunchMint vs Product Hunt deep dive |
| 10 | Comparison | LaunchMint vs Ahrefs |
| 11 | Customer story | First $10k MRR customer post-mortem |
| 12 | Vision | Where founder operating systems go next |

---

## Email marketing (Resend)

### Lifecycle drips

**Pre-signup (waitlist):**
- D0: Welcome to waitlist + directory PDF
- D7: "What we're building" update
- D14: Beta invite (when seats open)

**Post-signup (free user):**
- D0: Welcome + 5 things to do first
- D1: "Did you create your first product?" nudge if not
- D3: "Try the AI features" nudge if not used
- D7: First-week-progress email + upgrade nudge if hit limits
- D14: Founder interview from another LaunchMint user
- D30: "How's it going?" feedback email

**Post-signup (paid user):**
- D0: Welcome + plan summary
- D7: Power-user tips for your plan
- D30: Monthly digest with personalized stats
- D90: Renewal/retention check-in (if monthly)

**Newsletter (weekly, opt-out):**
- "Indie Mint" — every Tuesday: top launches, indie traction stat, one founder interview, one tutorial.

---

## Brand voice & copy rules

- **Founder-to-founder.** Write like a builder, not a marketer.
- **No hype words:** "revolutionary," "game-changer," "supercharge," "10x," "amazing."
- **No emojis.** Anywhere.
- **Concrete > abstract.** "200 directories in 2 hours" not "save time with our smart submission engine."
- **Empathetic about pain.** Founders are tired and broke. Don't add to it.
- **Pricing-honest.** No hidden fees, no dark patterns, no fake "limited offer" countdowns.
- **Confident, dry, technical.** We're a tool. Not a movement.

---

## Press kit

Available at `/press`:
- Logos (PNG, SVG, light/dark)
- Product screenshots (5+ in high res)
- Founder bio + headshot
- One-paragraph company description
- One-pager PDF
- Founder contact email

---

## Partnerships short-list (Months 1–6)

- **Form builders:** Tally, Typeform alternatives — co-launch with our review widget.
- **Indie newsletters:** Refind, IndieDojo, MicroConf newsletter.
- **Founder courses:** MicroConf, Indie Hackers premium.
- **No-code platforms:** Bubble, Webflow — directory of products built on each.
- **Stripe partnership program:** for verified MRR widget credibility.
