"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@launchmint/db";
import { requirePermission } from "@launchmint/auth";
import {
  PLANS,
  cancelSubscription,
  createSubscription,
  type PlanId,
} from "@launchmint/billing";
import { requireSession } from "@/lib/session";

export async function startSubscriptionAction(input: {
  plan: PlanId;
  billing: "monthly" | "yearly";
}) {
  const { ctx, userId, workspaceId } = await requireSession();
  requirePermission(ctx, "billing.manage");

  const plan = PLANS[input.plan];
  if (!plan || input.plan === "FREE") throw new Error("INVALID_PLAN");

  const razorpayPlanId =
    input.billing === "yearly"
      ? plan.razorpayPlanIdYearly
      : plan.razorpayPlanIdMonthly;
  if (!razorpayPlanId) {
    throw new Error(
      `Razorpay plan id not configured for ${plan.name} ${input.billing}`,
    );
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user) throw new Error("USER_NOT_FOUND");

  const sub = await createSubscription({
    planId: razorpayPlanId,
    customerEmail: user.email,
    customerName: user.name ?? user.email,
    totalCount: input.billing === "yearly" ? 5 : 24,
    notes: {
      workspaceId,
      plan: input.plan,
      billing: input.billing,
    },
  });

  // Stamp the pending subscription so the webhook can reconcile.
  await db.subscription.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      plan: input.plan,
      status: "TRIALING",
      razorpaySubId: sub.id,
    },
    update: {
      plan: input.plan,
      status: "TRIALING",
      razorpaySubId: sub.id,
    },
  });

  revalidatePath("/app/billing");
  const checkoutUrl =
    (sub as unknown as { short_url?: string }).short_url ??
    `https://rzp.io/i/${sub.id}`;
  redirect(checkoutUrl);
}

export async function cancelSubscriptionAction() {
  const { ctx, workspaceId } = await requireSession();
  requirePermission(ctx, "billing.manage");

  const sub = await db.subscription.findUnique({ where: { workspaceId } });
  if (!sub?.razorpaySubId) throw new Error("NO_SUBSCRIPTION");

  await cancelSubscription(sub.razorpaySubId, true);
  await db.subscription.update({
    where: { workspaceId },
    data: { cancelAtPeriodEnd: true },
  });

  revalidatePath("/app/billing");
}
