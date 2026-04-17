import crypto from "node:crypto";
import Razorpay from "razorpay";

let cached: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (cached) return cached;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set");
  }
  cached = new Razorpay({ key_id, key_secret });
  return cached;
}

export interface CreateSubscriptionArgs {
  planId: string;
  customerEmail: string;
  customerName: string;
  totalCount?: number;
  notes?: Record<string, string>;
}

export async function createSubscription(args: CreateSubscriptionArgs) {
  const rp = getRazorpay();
  return rp.subscriptions.create({
    plan_id: args.planId,
    total_count: args.totalCount ?? 12,
    customer_notify: 1,
    notes: args.notes,
  });
}

export async function cancelSubscription(subscriptionId: string, atCycleEnd = true) {
  const rp = getRazorpay();
  return rp.subscriptions.cancel(subscriptionId, atCycleEnd);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET not set");
  }
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
