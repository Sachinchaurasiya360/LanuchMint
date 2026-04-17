# LaunchMint — Design System & UI Spec

This document defines the brand, design tokens, components, and page-by-page UI for LaunchMint. Audience: designers, frontend engineers.

---

## Brand mandate

- **Colors:** White (#FFFFFF) and Yellow (#FACC15) only as brand. Neutral grays for structure. **No gradients.**
- **No emojis** anywhere — UI, marketing copy, transactional emails, error messages, docs.
- **Standard icons only** via Lucide (`lucide-react`). No custom illustrations at MVP.
- **Tone:** Confident, founder-to-founder, dry, technical. No marketing fluff. No "🚀" energy in copy.
- **Logo:** Wordmark `LaunchMint` in Inter Black, with a single yellow square accent.

---

## Color tokens

```ts
// packages/config/tailwind.preset.ts
export const colors = {
  brand: {
    yellow: {
      50:  "#FEFCE8",
      100: "#FEF9C3",
      200: "#FEF08A",
      300: "#FDE047",
      400: "#FACC15",   // primary
      500: "#EAB308",
      600: "#CA8A04",
      700: "#A16207",
      800: "#854D0E",
      900: "#713F12",
    },
    white: "#FFFFFF",
  },
  zinc: {
    50:  "#FAFAFA",
    100: "#F4F4F5",
    200: "#E4E4E7",
    300: "#D4D4D8",
    400: "#A1A1AA",
    500: "#71717A",
    600: "#52525B",
    700: "#3F3F46",
    800: "#27272A",
    900: "#18181B",
    950: "#09090B",
  },
  semantic: {
    success: "#16A34A",
    warning: "#EAB308",   // shares yellow
    danger:  "#DC2626",
    info:    "#0EA5E9",
  },
};
```

**Usage rules:**
- Background: `white` (light) and `zinc-950` (dark).
- Brand yellow reserved for: primary CTAs, active states, brand badge, key data highlights (DR badge, Verified MRR badge).
- Yellow is **never** used as a fill for body text, backgrounds, or large surfaces — buttons, badges, accents only.
- Body text: `zinc-900` on white, `zinc-100` on dark.
- Muted text: `zinc-500`.
- Borders: `zinc-200` (light), `zinc-800` (dark).
- Errors in `danger`. Success in `success`. Warnings tonally adjacent to brand yellow but visually distinct (warning has subtle border).

**No gradients.** Not even hover states. Use solid color shifts (`yellow-400` → `yellow-500`) and shadow changes for state.

---

## Typography

| Use | Font | Weight | Size |
|-----|------|--------|------|
| H1 (page) | Inter | 800 | 48 / 56 line |
| H2 (section) | Inter | 700 | 32 / 40 |
| H3 | Inter | 600 | 24 / 32 |
| H4 | Inter | 600 | 20 / 28 |
| Body | Inter | 400 | 16 / 24 |
| Small | Inter | 400 | 14 / 20 |
| Caption / label | Inter | 500 (uppercase, tracking-wider) | 12 / 16 |
| Code / data | JetBrains Mono | 400/500 | 14 / 20 |

**Loading:** `next/font` with subset preload. No FOIT — render system fallback first, swap.

---

## Spacing scale

Tailwind default (4px base): `0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32`. Page gutter: `px-6` mobile, `px-8` tablet, `px-12` desktop, max-width `1280px` for app, `1200px` for marketing.

---

## Elevation

Three shadow tokens — flat-by-default aesthetic:

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08);
--shadow-lg: 0 4px 6px -1px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.10);
```

Cards default to no shadow + `border border-zinc-200`. Shadow only on hover, popovers, toasts.

---

## Iconography

- **Library:** `lucide-react` exclusively.
- **Sizes:** 16px (inline), 20px (default), 24px (button), 32px (feature).
- **Stroke:** 1.75 default, 2 for emphasis.
- Color: inherit from parent text color. Yellow only for active/selected/brand emphasis.
- Replace any emoji you find in mockups with the closest Lucide icon. (`Rocket` for launch, `Star` for review, `LineChart` for SEO, `Folder` for directory, etc.)

---

## Component library (`packages/ui`, Shadcn-based)

**Primitives shipped at MVP:**

| Component | Notes |
|-----------|-------|
| `Button` | `variant: primary \| secondary \| ghost \| destructive`, `size: sm \| md \| lg`, `loading` |
| `Input` | Text/email/url, with leading icon support, error state |
| `Textarea` | Auto-grow up to max-rows |
| `Select` | Headless UI based |
| `Combobox` | Async option loading |
| `Checkbox`, `Radio`, `Switch` | – |
| `Card` | Border + optional header/footer |
| `Badge` | `variant: yellow \| neutral \| success \| danger`, `size: sm \| md` |
| `Avatar` | Initials fallback |
| `Tabs` | Underline yellow active |
| `Dialog` / `Sheet` | Modal + side panel |
| `Toast` | Top-right, 5s default |
| `Tooltip` | Dark theme, 4px arrow |
| `Popover` | – |
| `DropdownMenu` | – |
| `Table` | Sortable headers, sticky first column option |
| `Pagination` | Cursor-based UI |
| `EmptyState` | Icon + headline + body + CTA |
| `Skeleton` | Pulse animation, no shimmer gradient |
| `ProgressBar` | Solid yellow fill |
| `Stepper` | Onboarding |
| `KPI` | Number + label + delta indicator |
| `LineChart`, `BarChart`, `Sparkline` | Built on `recharts`, themed |
| `CodeBlock` | JetBrains Mono, copy button |
| `Form` | RHF + Zod adapters with our `Input`/`Textarea`/etc. |
| `MarkdownRenderer` | DOMPurify-sanitized, brand-styled headings |

**Component test:** every `packages/ui` component must have a Storybook story + a Vitest snapshot test.

---

## Layout patterns

### Marketing layout

```
┌────────────────────────────────────────────┐
│  Top nav (white, sticky, 64px)             │
│  Logo |  Product ▼  Solutions  Pricing  …  │ Sign in │ Launch your product (yellow) │
├────────────────────────────────────────────┤
│                                            │
│   [Hero]  H1 + sub + 2 CTAs + product img │
│                                            │
├────────────────────────────────────────────┤
│   Logo strip (8 customer logos)            │
├────────────────────────────────────────────┤
│   Feature blocks (alternating l/r, 4-6)    │
├────────────────────────────────────────────┤
│   Social proof (stats, testimonials)       │
├────────────────────────────────────────────┤
│   Pricing teaser                           │
├────────────────────────────────────────────┤
│   FAQ (accordion)                          │
├────────────────────────────────────────────┤
│   Footer (5 columns + small print)         │
└────────────────────────────────────────────┘
```

### App layout (logged-in)

```
┌─────────────────────────────────────────────────────┐
│ Top bar 56px                                        │
│ Workspace switch │       │  search  │ bell │ avatar │
├─────────┬───────────────────────────────────────────┤
│ Sidebar │  Page content (max-w-1280, px-8)          │
│ 240px   │                                            │
│         │                                            │
│ • Home  │                                            │
│ • Prod  │                                            │
│ • …     │                                            │
└─────────┴───────────────────────────────────────────┘
```

Mobile: sidebar collapses to bottom-tab bar (5 primary items: Home, Products, Reviews, SEO, More).

---

## Dashboard navigation (final spec)

### Left sidebar — primary

1. **Home** — Onboarding checklist OR KPI overview
2. **Products** — list + detail
3. **Launches** — schedule + history
4. **Reviews** — inbox + invite
5. **SEO** — overview + keywords + backlinks + competitor (V1)
6. **Directories** — DB + my submissions
7. **Founder Profile** — editor + preview

### Left sidebar — secondary (collapsible group: "Workspace")

8. **Team** (V1)
9. **Agency / Clients** (V1, Agency role only)
10. **Reports** (V1)
11. **Integrations** — Stripe, X, LinkedIn
12. **Billing** — plan, invoices, usage meter
13. **Settings** — workspace, profile, security

### Top bar

- Workspace switcher (left)
- Global search (Cmd+K) (center)
- Notifications bell (right) — V1
- Avatar menu (right) — Profile, Switch account, Sign out

---

## Page-by-page UI notes

### Public

**Landing `/`**
- Hero: H1 "Turn visibility into velocity." Sub: "Launch, review, rank, and grow your startup — all in one platform." Primary CTA: "Launch your product" (yellow). Secondary: "Discover startups" (ghost).
- Feature grid (6): Launch / Reviews / SEO / Backlinks / Directories / Founder identity.
- Social proof: "X,XXX founders, Y,XXX products launched, Z,XXX reviews collected" (live counters).
- Pricing teaser → /pricing.
- FAQ.
- Footer.

**Today's leaderboard `/today`**
- Top 5 highlighted as larger cards with logo, tagline, upvote count, founder name + avatar.
- Below, ranked list of all today's launches with smaller cards.
- Right rail: "Today's verticals" (top categories), "Founders to watch".

**Product page `/products/[slug]`**
- Header: logo, name, tagline, founder card, upvote button (yellow), "Visit website" button.
- Tabs: Overview / Reviews / Comments / Founders / Stats.
- Right rail: Trust score badge, Verified MRR widget, Categories, Backlink count, "Featured on LaunchMint" badge embed code.
- Below fold: Description (markdown), Screenshots (carousel), Reviews list, Comments list.
- JSON-LD: `Product` + `AggregateRating`.

**Founder profile `/founders/[slug]`**
- Header: avatar, name, headline, location, social links.
- Stats row: products launched, total reviews, total MRR (if shared), backlinks earned.
- Sections: Products (cards), Reviews left, Comments, Activity feed.
- JSON-LD: `Person`.

**Directory page `/directories/[slug]`**
- Header: directory logo (favicon scrape), name, DR badge, cost.
- Description (we own — not the directory's marketing copy).
- "Submit your product to [Directory]" CTA (yellow).
- Recent submissions (founder list + product).
- Related directories.

**Comparison `/compare/[a]-vs-[b]`**
- Side-by-side table: tagline, category, pricing, MRR, reviews avg, DR, key features.
- Reviews from each side (3 each).
- "Try LaunchMint to claim your product" CTA at bottom.
- JSON-LD: `Product` × 2.

**Best-of `/best/[category]`**
- Top 10 products in the category.
- Each entry: rank, logo, name, tagline, score, "Visit" + "View profile" CTAs.
- Methodology section (transparency wins SEO trust).

**Pricing `/pricing`**
- 5-column table (Free, Starter, Growth, Pro, Agency).
- Annual/monthly toggle (annual = 2 free months).
- Feature comparison matrix.
- FAQ.
- "Talk to sales" CTA on Agency.

### Dashboard

**Home `/app`**
- Until onboarding complete: stepper showing next action.
- Post-onboarding: 4 KPI cards (Today's upvotes, New reviews, Backlinks gained, MRR).
- "What needs your attention" feed: pending review replies, new backlinks lost, draft launches.

**Products list `/app/products`**
- Table: name, status, upvotes, reviews, last launch.
- Top right: "+ New product" (yellow).

**Product editor `/app/products/[id]`**
- Tabs: Overview / Launch / Reviews / SEO / Directories / Settings.
- Overview: name, tagline, description (rich), category, logo upload, screenshots, links, AI "Improve description" button.
- Right rail: Launch readiness score (out of 100) with checklist.

**Launch scheduler `/app/launches`**
- Calendar view + list.
- New launch wizard (4 steps).

**Reviews `/app/reviews`**
- Inbox: list of reviews with star, name, date, status.
- Filters: rating, verified, replied/unreplied, flagged.
- Detail panel: review + AI-suggested reply + manual reply box.
- "Invite reviewers" panel: paste emails OR copy magic link.

**SEO `/app/seo`**
- Overview cards: DR, organic traffic, keywords ranked, backlinks (with WoW deltas).
- Tabs: Keywords / Backlinks / Competitors (V1).
- Sparklines on each card.
- "Refresh now" button (rate-limited).

**Directories `/app/directories`**
- Browser: filter by category, DR, cost.
- Each row: name, DR, cost, status (not submitted / pending / live), "Submit" button.
- Top: "AI prioritize for me" (yellow ghost button) → reorders by AI relevance × DR.

**Founder Profile `/app/profile`**
- Editor on left, live preview on right.

**Billing `/app/billing`**
- Current plan card (yellow border for active).
- Usage meter (AI credits, SEO domains, directory submissions).
- Upgrade/downgrade buttons.
- Invoice list.

**Settings `/app/settings`**
- Tabs: Workspace / Profile / Integrations / Security / Privacy / API keys (V1).

---

## Email templates (Resend, React Email)

Same brand: white background, yellow CTA button, no emoji, no gradient.

Templates required at MVP:

1. `welcome.tsx`
2. `onboarding-nudge.tsx` (D+1 if onboarding incomplete)
3. `launch-reminder-d3.tsx`
4. `launch-reminder-d1.tsx`
5. `launch-live.tsx`
6. `review-invite.tsx` (includes magic link)
7. `review-received.tsx` (to founder)
8. `review-replied.tsx` (to reviewer)
9. `weekly-seo-digest.tsx`
10. `payment-receipt.tsx`
11. `payment-failed.tsx`
12. `subscription-canceled.tsx`
13. `directory-submission-live.tsx`
14. `team-invite.tsx`
15. `account-deleted.tsx`

V1:
16. `backlink-gained.tsx`
17. `backlink-lost.tsx`
18. `referral-converted.tsx`
19. `affiliate-payout.tsx`
20. `report-ready.tsx`

Each template:
- 600px max width
- Plaintext fallback
- Single yellow CTA per email
- Footer: unsubscribe + physical address (CAN-SPAM)

---

## Accessibility

- WCAG 2.1 AA target.
- All interactive elements keyboard-navigable, visible focus ring (yellow `ring-2 ring-yellow-400 ring-offset-2`).
- Color contrast checked: yellow-400 fails on white as text, so yellow only on buttons/badges where text is dark zinc-900.
- All images: `alt` required (lint rule).
- Forms: `<label for>` + ARIA descriptions for errors.
- Modals: focus trap + ESC close + return focus.
- Charts: text equivalents below.

---

## Mobile responsiveness

- Mobile-first Tailwind.
- Breakpoints: `sm: 640px, md: 768px, lg: 1024px, xl: 1280px`.
- Dashboard: hamburger → side sheet on `< md`. Bottom tab bar on `< md` for top 5 sections.
- Public pages: hero stacks; feature grid → single column on mobile; tables become stacked cards.

---

## Loading & empty states

- Every list view has a defined empty state with icon + CTA.
- Every async area shows skeleton, not spinner (perception of speed).
- Failed loads show retryable error card, not just "Error".

---

## Motion

- **Default:** none. Minimal motion language.
- **Allowed:** 150ms fade for toasts, 200ms slide for sheets, 100ms color transition on hover.
- **Forbidden:** parallax, scroll-jacking, hero animations, gradient sweeps.

---

## Design hand-off

- Figma file: `LaunchMint Design System.fig` (lives in shared Figma).
- Tokens synced to `packages/config/tailwind.preset.ts` via Style Dictionary (V1).
- Component library code-of-truth: `packages/ui` Storybook.
