import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Stripe is read-only here: we use Stripe Connect to pull verified MRR
 * from connected founder accounts to power the "Verified MRR" badge.
 * We do NOT charge customers via Stripe — Razorpay handles billing.
 */
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_CLIENT_SECRET;
  if (!key) {
    throw new Error("STRIPE_CLIENT_SECRET not set");
  }
  cached = new Stripe(key, { apiVersion: "2024-11-20.acacia" });
  return cached;
}

export interface VerifiedMrrSnapshot {
  accountId: string;
  mrrUsd: number;
  currency: string;
  activeSubscriptions: number;
  fetchedAt: string;
}

/**
 * Compute MRR from a connected Stripe account by summing active subscription
 * monthly amounts. Uses the Stripe-Account header (Connect).
 */
export async function getVerifiedMrr(accountId: string): Promise<VerifiedMrrSnapshot> {
  const stripe = getStripe();
  const subs = await stripe.subscriptions.list(
    { status: "active", limit: 100, expand: ["data.items.data.price"] },
    { stripeAccount: accountId },
  );

  let mrrCents = 0;
  let currency = "usd";
  for (const sub of subs.data) {
    for (const item of sub.items.data) {
      const price = item.price;
      if (!price.unit_amount || !price.recurring) continue;
      currency = price.currency;
      const monthly =
        price.recurring.interval === "year"
          ? price.unit_amount / 12
          : price.recurring.interval === "month"
            ? price.unit_amount
            : 0;
      mrrCents += monthly * (item.quantity ?? 1);
    }
  }

  return {
    accountId,
    mrrUsd: mrrCents / 100,
    currency,
    activeSubscriptions: subs.data.length,
    fetchedAt: new Date().toISOString(),
  };
}
