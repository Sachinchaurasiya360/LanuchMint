# LaunchMint — SEO Strategy

LaunchMint is **an SEO product**, so its own SEO must be exemplary. This document defines the programmatic SEO strategy, content strategy, technical SEO baseline, and SEO data sourcing.

---

## Strategic premise

We don't compete on paid acquisition (bootstrap). We compete on **owning the long tail** of high-intent founder-and-buyer queries:

- `[product-name] reviews`
- `[product-name] alternatives`
- `[product-name] vs [competitor]`
- `best [category] tools 2026`
- `[founder-name]` (founder identity SERP)
- `startup directories`
- `[city] startups`
- `[country] saas companies`

Each launch, review, and submission produces a permanent, indexable asset. We compound.

---

## Page taxonomy

| URL pattern | Type | Content source | ETA |
|-------------|------|----------------|-----|
| `/` | Static | Marketing | MVP |
| `/today` | ISR 60s | Daily leaderboard | MVP |
| `/launches/[date]` | ISR 24h | Historical | MVP |
| `/products/[slug]` | ISR 60s | Founder + reviews + AI sections | MVP |
| `/founders/[slug]` | ISR 1h | Founder profile | MVP |
| `/categories/[slug]` | ISR 1h | Aggregated products | MVP |
| `/directories` | ISR 1h | Directory DB | MVP |
| `/directories/[slug]` | ISR 24h | Directory detail | MVP |
| `/best/[category]` | ISR 24h | Top 10 in category | MVP |
| `/compare/[a]-vs-[b]` | ISR 24h | Auto-generated comparison | MVP |
| `/alternatives/[product]` | ISR 24h | Alternatives list | V1 |
| `/industries/[slug]` | ISR 24h | Industry vertical aggregate | V1 |
| `/[country]/startups` | ISR 24h | Geo-aggregated startups | V1 |
| `/[city]/startups` | ISR 24h | Geo-aggregated startups | V1 |
| `/use-cases/[slug]` | Static | Marketing pages | MVP |
| `/blog/[slug]` | ISR 1h | Editorial | MVP |

**Index thresholds (anti-thin-content gates):**
- `/categories/[slug]` indexes only when ≥ 5 products.
- `/best/[category]` indexes only when ≥ 10 products.
- `/compare/[a]-vs-[b]` indexes only when both products have ≥ 3 reviews each.
- `/[city]/startups` indexes only with ≥ 10 startups.
- `/[country]/startups` indexes only with ≥ 25 startups.
- Below threshold: page returns 200 with `<meta name="robots" content="noindex">`.

---

## Technical SEO baseline (every page)

### Required on every page
- Server-rendered HTML (SSR or ISR — never client-only).
- One `<h1>` per page, descriptive of the unique entity.
- Semantic structure: `<article>`, `<section>`, `<nav>`, `<aside>`.
- Canonical URL.
- OG + Twitter cards (image, title, description).
- JSON-LD structured data (see below).
- Internal links from at least 2 other indexable pages (link equity flow).
- `lang` attribute on `<html>`.
- Mobile viewport meta.

### Performance budget (Core Web Vitals)
- **LCP** ≤ 2.0 s (slow 4G)
- **INP** ≤ 200 ms
- **CLS** ≤ 0.1
- **Total transfer size** ≤ 250 KB compressed (excluding hero image)
- **No client-side hydration for read-only sections** — Next.js Server Components.

### Image optimization
- All images via `next/image` with `width`/`height`.
- AVIF + WebP, JPEG fallback.
- Lazy load below the fold.
- Alt text required (lint rule).
- `loading="eager"` only on the hero LCP image.

### Crawl efficiency
- `robots.txt` — Allow all public, disallow `/app/*`, `/api/*` (except `/api/v1/public/*`).
- Sitemap index + 5+ split sitemaps (50k URLs each).
- IndexNow ping on every publish/update.
- Sitemaps submitted to GSC + Bing Webmaster Tools.
- Pagination uses `<link rel="next/prev">`.

### Rendering
- All pages server-rendered. No client-only routes for indexable content.
- Streaming where supported (faster TTFB).
- Edge runtime for high-traffic public pages where possible.

---

## JSON-LD structured data

Implemented in `packages/seo-meta/jsonld.ts`. Every public page emits the appropriate type.

### `/products/[slug]`
- `Product` (name, description, image, brand=founderName, offers if pricing known)
- `AggregateRating` (ratingValue, reviewCount)
- `Review` × top-N (author, rating, body, datePublished)
- `BreadcrumbList`
- `FAQPage` if FAQ section present

### `/founders/[slug]`
- `Person` (name, image, jobTitle, sameAs: socials)
- `BreadcrumbList`

### `/categories/[slug]`, `/best/[category]`
- `ItemList` (with `Product` items)
- `BreadcrumbList`

### `/compare/[a]-vs-[b]`
- Two `Product` blocks
- `Article` wrapping the comparison
- `BreadcrumbList`

### `/directories/[slug]`
- `WebSite` (the directory)
- `Organization` (the directory's parent)

### Marketing pages
- `Organization` (LaunchMint)
- `WebSite` (with `SearchAction` for sitelinks search box)
- `BreadcrumbList`

---

## Programmatic SEO — quality gates

The fastest way to a Google penalty is mass-producing thin pages. Our gates:

### Content minimums
- 350+ words of unique content per page.
- At least one unique data point per page (review count, MRR, backlink count, founder bio, etc.).
- AI-generated boilerplate is allowed only for sections clearly differentiated by entity data.

### De-duplication
- Comparison pages render distinct content for `a-vs-b` and `b-vs-a` (we redirect one to the other based on alphabetical order — canonical is `min(a,b)-vs-max(a,b)`).
- Alternatives pages link to the source product's page; do not duplicate descriptions.

### Freshness
- Every programmatic page shows `lastUpdated` date.
- Background job re-renders monthly; `lastUpdated` only bumps when underlying data changes.

### Crawl budget protection
- `noindex` low-quality pages (deleted founders, archived products).
- Use `disallow` for filter URLs (e.g., `/directories?cost=free`) — only the canonical lists are indexed.

### Internal linking automation
- Every product page links to: founder profile, category, top 3 alternatives, top 3 comparison pages.
- Every founder page links to: every product they own, top categories they operate in.
- Every category page links to: top products, related categories, top founders in category.

---

## SEO data sourcing

### Primary source: DataForSEO
- DR (Domain Authority) — daily for tracked domains, cached 24h.
- Backlinks — weekly snapshot of top 100, full crawl monthly.
- Keyword rankings — weekly for tracked keywords, default country = US, founder can configure.
- Search volume + difficulty — on-demand for keyword research tool.
- Spam score — weekly.

### Cost guard
- DataForSEO is pay-as-you-go. Cache aggressively.
- Free tier users: weekly refresh only, 1 domain.
- Starter: weekly, 2 domains.
- Growth: weekly, 5 domains, on-demand refresh once/week.
- Pro: daily on critical metrics, 15 domains, on-demand 5×/week.
- Agency: pooled across clients.

### Future sources (V1+)
- Google Search Console API for owned-domain data (requires user OAuth — much richer than third-party estimates).
- Bing Webmaster Tools API.
- Internal "real" backlink crawler (cheaper at scale, V2).

---

## Content strategy (founder-led editorial)

### Pillar topics (primary content categories)
1. **Launch playbooks** — "How to launch on X", post-launch retros, anti-patterns.
2. **SEO for founders** — tutorials, case studies from our own data.
3. **Indie traction reports** — weekly / monthly data drops from our DB.
4. **Founder interviews** — long-form (2,000+ words).
5. **Tool deep-dives** — competitor analyses, alternatives roundups.

### Cadence (MVP → V1)
- 2 founder interviews / week
- 1 weekly indie traction report
- 2 SEO/launch tutorials / week
- 1 monthly data drop ("we analyzed 1,000 launches and...")

### Owned data we can publish (defensible content)
- Average DR boost from each directory.
- Best launch day-of-week / time-of-day.
- Correlation between launch readiness score and Day-30 traffic.
- Distribution of MRR by category.
- Review velocity vs Trust Score growth.

### Distribution
- Each post auto-syndicated as long-form X thread + LinkedIn article.
- Email digest weekly to all users.
- RSS feed for `/blog`.

---

## On-page SEO checklist (per launch — surfaced in app)

- [ ] Title 50–60 chars including primary keyword
- [ ] Meta description 140–160 chars
- [ ] H1 unique, descriptive
- [ ] At least 350 words of unique copy in description
- [ ] Logo with descriptive alt text
- [ ] At least 3 screenshots with alt text
- [ ] Category set
- [ ] Product website URL valid + reachable
- [ ] At least 1 backlink earned in first 30 days
- [ ] At least 3 reviews collected in first 30 days

Driven by the **Launch Readiness Score** (AI scored, see `packages/ai/prompts/launch_readiness.ts`).

---

## SEO workflow per product launch

```
1. Founder publishes product (DRAFT → SCHEDULED → LIVE)
2. ISR builds /products/[slug]; sitemap index updated within 60s
3. IndexNow pinged
4. Internal links auto-injected:
     - Founder profile updates → links to product
     - Category page rebuilds → includes product
     - 3 alternatives pages updated to include product
5. Day +7: AI scores SEO completeness; nudge founder if < 80
6. Day +30: Backlink scan reports new live backlinks; founder gets badge milestone
7. Day +90: Page candidacy for /best/[category] (if score + reviews qualify)
8. Day +180: AI re-scans, updates description with current metrics
```

---

## SEO workflow for the platform itself (own marketing)

### Pre-launch (Weeks -8 to 0)
- Lock down brand keyword: `launchmint`.
- Build 30 cornerstone pages (use cases, comparisons vs competitors).
- Outreach to 50 indie hacker / SaaS blogs for review coverage at launch.

### Launch month
- Self-host on the platform (LaunchMint launches on LaunchMint).
- 10 podcast appearances.
- HN Show post.

### Months 1–6
- Publish 8–10 cornerstone posts/month.
- Programmatic pages start ranking on long-tail at month 3.
- First wave of comparison pages (`launchmint-vs-product-hunt`, etc.) live at month 1.

### Month 6+
- Backlink-building campaign: free embeddable badges + DR badges → backlinks to us.
- Outreach: link insertions in roundup posts.

---

## Measurement

### Tracked metrics (weekly review)
- Total indexed pages (GSC)
- Avg position for target keyword set (top 50 keywords)
- Organic clicks / impressions / CTR
- Top-10 ranking keyword count
- Top-3 ranking keyword count
- DR over time
- Referring domains over time
- Lost backlinks alerts

### Tooling
- GSC for ground truth.
- Bing Webmaster Tools for Bing.
- DataForSEO for SERP tracking against tracked keywords.
- PostHog for landing-page → signup funnel.

### Targets (12-month)
- 10,000+ indexed pages
- 500+ keywords ranking top-10
- 100+ keywords ranking top-3
- DR ≥ 40
- 100,000+ organic clicks/month

---

## Schema rollout map

| Sprint | Schema added |
|--------|-------------|
| 1 | `Organization`, `WebSite` (with SearchAction) |
| 2 | `Person` (founders), `BreadcrumbList` |
| 3 | `Product` (basic) |
| 4 | `Review`, `AggregateRating` |
| 5 | `ItemList` (categories, best-of) |
| 6 | `FAQPage` |
| 7 | Sitemap index + IndexNow live |
| 9 | Per-page schema validator in CI (Schema.org validator API) |

---

## Anti-patterns (do not do)

- No keyword stuffing in product descriptions.
- No invisible text, hidden links, doorway pages.
- No automatic spinning of competitor content.
- No mass-creating fake reviews to power AggregateRating.
- No `<meta refresh>` redirects.
- No exact-match anchor text spam in our own footer/internal links.
- No paid backlinks.
- No over-optimization of meta titles to the point of looking spammy ("Best Free Top SaaS Tool 2026 No.1 Cheap").
