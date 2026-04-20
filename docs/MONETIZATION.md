# LaunchMint - Monetization, Pricing, Billing

This document defines pricing, plan gating, billing implementation, referrals, and affiliates.

---

## Pricing tiers (recommended - final founder decision)

> Original brief specified $69 / $149 / $199 (Starter / Growth / Agency). Recommendation below restructures with a $29 Starter for solo founder ICP and a $299 Agency tier for clearer ladder. Founder may revise.

| Plan | Monthly | Annual | Target persona |
|------|--------:|--------:|----------------|
| **Free** | $0 | $0 | Trial / hobbyist |
| **Starter** | $29 | $290 (= 2 mo free) | Solo SaaS founder |
| **Growth** | $79 | $790 | Small SaaS team (2–5) |
| **Pro** | $149 | $1,490 | Power founder / SMB |
| **Agency** | $299 | $2,990 | Agency reselling to clients |

Currency:
- Default USD globally.
- INR pricing displayed for India IPs (auto-converted; Razorpay handles).
- EU VAT collected via Razorpay.

---

## Feature & limit matrix

| Capability | Free | Starter | Growth | Pro | Agency |
|---|---:|---:|---:|---:|---:|
| Products listed | 1 | 3 | 10 | unlimited | unlimited |
| Founder profiles | 1 | 1 | 5 | 10 | 25 |
| Team seats | 1 | 1 | 5 | 10 | 25 |
| Workspaces (parent) | 1 | 1 | 1 | 1 | 1 + clients |
| Client workspaces (Agency) | – | – | – | – | unlimited |
| Launches per month | 1 | 3 | 10 | unlimited | unlimited |
| Launch readiness AI | basic | full | full | full | full |
| Reviews collected | unlimited | unlimited | unlimited | unlimited | unlimited |
| Review invites / month | 25 | 250 | 1,000 | unlimited | unlimited |
| Verified MRR widget | – | ✓ | ✓ | ✓ | ✓ |
| AI credits / month | 30 | 500 | 2,000 | 10,000 | 30,000 (pooled) |
| AI credit overage | – | $10 / 1,000 | $10 / 1,000 | $10 / 1,000 | $10 / 1,000 |
| SEO domains tracked | 1 | 2 | 5 | 15 | 50 (pooled) |
| SEO refresh frequency | weekly | weekly | weekly + on-demand 1×/wk | daily + on-demand 5×/wk | daily + on-demand 20×/wk |
| Backlink monitoring (top N) | 25 | 100 | 250 | 1,000 | 2,500 |
| Keyword tracking | 5 | 25 | 100 | 300 | 1,000 |
| Competitor SEO compare | – | 1 | 3 | 5 | 10 (per client) |
| Directory submissions / mo | 5 | 50 | 200 | unlimited | unlimited |
| Auto-submission (API) | – | ✓ | ✓ | ✓ | ✓ |
| Directory prioritization AI | – | ✓ | ✓ | ✓ | ✓ |
| Embeddable badges | LaunchMint required | yes | yes | yes | yes (white-label) |
| LaunchMint badge required on product page | yes | – | – | – | – |
| Public analytics widget | – | – | ✓ | ✓ | ✓ |
| PDF / CSV export | – | – | ✓ | ✓ | ✓ (white-label) |
| White-label dashboard | – | – | – | – | ✓ |
| White-label PDF | – | – | – | – | ✓ |
| Custom domain (CNAME) | – | – | – | – | ✓ (V1) |
| Notifications (in-app + email) | email only | full | full | full | full |
| Founder DMs (V2) | – | – | ✓ | ✓ | ✓ |
| Investor profile listing | – | – | ✓ | ✓ | ✓ |
| Public API (V2) | – | – | – | ✓ | ✓ |
| API rate limit | – | – | – | 600 rpm | 6,000 rpm |
| Priority support | – | email | email | chat | dedicated |
| SLA | – | – | – | 99.9% | 99.95% |

---

## Free plan strategic role

Free is a **viral acquisition + product-led growth** lever, not a product. Limits are deliberately tight:

- 1 product, 1 launch per month, weekly SEO refresh, 30 AI credits.
- "Featured on LaunchMint" badge **required** on product page (free backlink for us).
- 5 directory submissions / month.

**Why this works:**
- Founders sign up to launch, get value within an hour.
- Hit AI / SEO / submission caps within first week if active.
- Upgrade trigger: "You've used 30/30 AI credits - upgrade to keep generating."

---

## Plan gating implementation

All gating in `packages/billing/gating.ts`. Single source of truth:

```ts
export const PLAN_LIMITS = {
  FREE: { products: 1, aiCredits: 30, seoDomains: 1, ... },
  STARTER: { products: 3, aiCredits: 500, seoDomains: 2, ... },
  ...
};

export function checkLimit(workspace, key, currentUsage) {
  const limit = PLAN_LIMITS[workspace.plan][key];
  if (limit === Infinity) return { ok: true };
  if (currentUsage >= limit) return { ok: false, reason: "QUOTA_EXCEEDED", upgradeTo: ... };
  return { ok: true, remaining: limit - currentUsage };
}
```

API handlers and UI both call `checkLimit()`. UI shows "X / Y used" everywhere a limit applies.

---

## Usage metering

`UsageCounter` table (per workspace, per billing period):

```
periodStart, periodEnd
aiCreditsUsed, seoChecksUsed, directorySubmissions, reviewInvitesSent, reportsExported
```

- Every action increments counter via DB transaction.
- Period rollover at subscription anniversary (worker job at 00:05 UTC).
- Soft warn at 80% (in-app banner + Resend email).
- Hard block at 100% with upgrade CTA.

---

## Billing implementation (Razorpay)

### Why Razorpay (not Stripe Billing)
- INR-friendly (UPI, India is a major founder market).
- Global card support adequate.
- Stripe used **read-only** (Connect) to pull MRR for the verified MRR widget - never for billing.
- Re-evaluate at Month 12 if US/EU paid mix exceeds 60%.

### Subscription model
- Razorpay Subscriptions API.
- One plan per (Plan × Interval): 8 plans total (4 paid × 2 intervals).
- Trial: optional 14-day trial on Starter and Growth (no card required).
- Prorations on upgrade (immediate).
- Cancellations: take effect at period end; downgrade to Free.

### Webhooks (Razorpay → us)
| Event | Action |
|-------|--------|
| `subscription.activated` | mark `Subscription.status = ACTIVE`, set period dates |
| `subscription.charged` | log invoice, send receipt via Resend |
| `subscription.completed` | period end (renewing automatically - no action needed) |
| `subscription.cancelled` | mark `cancelAtPeriodEnd = true`, send confirmation |
| `subscription.halted` | mark `PAST_DUE`, dunning email sequence (D+1, D+3, D+7) |
| `payment.failed` | retry via Razorpay's built-in dunning |

All webhooks HMAC-verified, idempotent (event id stored).

### Dunning sequence (PAST_DUE)
- D+0: payment failed email
- D+3: reminder + grace period notice
- D+7: subscription suspended email; account moved to Free; data retained
- D+30: warning of possible content unindex (does not delete)

### Invoicing
- All invoices generated by Razorpay; mirrored to `Invoice` table.
- PDF download via `/app/billing/invoices/[id]`.
- VAT/GST handled by Razorpay per region.

### Refunds
- Self-serve refund within 7 days of charge for monthly plans (no questions).
- Annual: pro-rata refund for unused months on cancellation.

---

## Stripe Connect (for verified MRR - NOT billing)

- Founder authorizes via Stripe OAuth.
- We store `Integration { type: STRIPE, accessToken (encrypted) }`.
- Daily worker job pulls MRR via `subscriptions.list` + computes net MRR.
- Stored in `MrrSnapshot`.
- Displayed on product + founder profile.
- Never accept charges via Stripe.

---

## Referral system (V1)

### Mechanic
- Every paid user gets a unique referral code (e.g., `priya123`).
- Shareable URL: `https://launchmint.com/?ref=priya123`.
- Referred user signs up + converts to any paid plan within 30 days → both parties get **1 free month** of their current plan.
- Reward stacks (refer 5 paying users → 5 free months).
- Tracked in `Referral` table.

### Why "1 free month" (not cash)
- Aligned: rewards keep users on the platform.
- Cash flow positive: no payouts, just credit.
- Cash referrals available via the Affiliate program (separate path).

### UX
- `/app/referrals` shows: my code, link, share buttons (X, LinkedIn, copy), conversions, free months banked.
- Resend email when referral converts.

### Anti-fraud
- Self-referral blocked (same user.email or same payment fingerprint).
- Reward only on paid conversion (not free signup).
- Audit log for every reward grant.

---

## Affiliate system (V1)

For non-customers (creators, bloggers, podcasters) who promote LaunchMint.

### Mechanic
- Apply at `/affiliates/apply` (manual approval at MVP V1).
- 30% recurring commission for 12 months on every referred paying customer.
- Commissions tracked in `Affiliate` + `AffiliateConversion`.
- Payout monthly via PayPal or Razorpay payout (min $50).

### Tracking
- Affiliate code `?aff=username`.
- Cookie set 60 days.
- Last-click attribution.

### Anti-fraud
- Self-referral blocked.
- Refunded customers reverse the affiliate commission.
- Payout only after 30-day refund window passes.

---

## Pricing page UX (`/pricing`)

### Layout
- Hero: H1 "Pricing built for solo founders that scales with your team."
- Annual / monthly toggle (defaults to Annual, shows "save 2 months").
- 5 plan cards in a row (responsive: stack on mobile).
- Each card: plan name, price, 1-line target persona, top 5 features, primary CTA, "Compare plans" link.
- Below cards: full feature comparison matrix (the table from above).
- FAQ accordion.
- "Trusted by founders at..." logo strip.
- Final CTA: "Talk to sales" (opens Calendly link, only Agency).

### Highlight strategy
- "Most popular": Growth.
- "Recommended for solo founders": Starter.
- Free shown but de-emphasized (lighter card, no border).

### CTAs
- Free: "Get started"
- Starter / Growth: "Start 14-day trial" (no card required)
- Pro: "Start trial" or "Upgrade"
- Agency: "Talk to sales"

---

## Subscription gating UX patterns

- **Hard gate (modal):** When user tries an action requiring a plan they don't have → modal "This requires Growth or higher" + "Upgrade" + "Maybe later".
- **Soft gate (banner):** Approaching limit → banner "You've used 80% of your AI credits. Upgrade for more."
- **Inline gate (locked feature):** Feature visible but with lock icon + tooltip "Upgrade to Pro to unlock backlink alerts."
- **Empty state gate:** Brand new user with no data → empty state explains the feature + CTA "Try free / upgrade".

---

## Metrics & dashboards (internal)

- MRR, ARR (live)
- New MRR / Churn / Expansion / Contraction (per cohort)
- Free → paid conversion rate (rolling 30/60/90)
- Plan distribution (% of paid by plan)
- ARPU
- LTV (rolling 6-mo)
- Gross margin (revenue – COGS: AI + DataForSEO + infra)
- CAC payback (when paid spend begins)
- Trial → paid conversion
- Voluntary vs involuntary churn

Tracked in PostHog + a custom internal dashboard at `/app/admin/finance` (SuperAdmin only).

---

## COGS targets (per paid user / month)

| Cost item | Free | Starter | Growth | Pro | Agency |
|-----------|----:|------:|------:|----:|------:|
| Gemini AI | $0.05 | $0.50 | $2.00 | $8.00 | $20.00 |
| DataForSEO | $0.10 | $0.50 | $1.50 | $5.00 | $15.00 |
| Infra share | $0.05 | $0.20 | $0.50 | $1.00 | $2.00 |
| Email (Resend) | $0.01 | $0.05 | $0.10 | $0.20 | $0.50 |
| **Total COGS** | **$0.21** | **$1.25** | **$4.10** | **$14.20** | **$37.50** |
| **Gross margin** | n/a | 96% | 95% | 90% | 87% |

Caps in `packages/ai` and `packages/seo-data` enforce the plan-level limits to prevent margin blowout.

---

## Tax & compliance

- USD pricing global default.
- Razorpay handles GST (India), VAT (EU) collection + invoicing.
- Tax rates auto-set by Razorpay.
- 1099 / equivalent reporting for affiliate payouts (we issue annually).
- All invoices PDF-downloadable + emailed at issuance.
