import { NextResponse } from "next/server";
import { db } from "@launchmint/db";
import { verifyWebhookSignature } from "@launchmint/billing";
import { enqueue } from "@launchmint/queue";
import { track } from "@launchmint/analytics";

export const runtime = "nodejs";

interface RzpSubscription {
  id: string;
  status?: string;
  current_start?: number;
  current_end?: number;
  customer_id?: string;
  notes?: Record<string, string>;
}

interface RzpPayment {
  id: string;
  amount: number;
  currency: string;
  invoice_id?: string;
  email?: string;
}

interface RzpInvoice {
  id: string;
  short_url?: string;
  period_start?: number;
  period_end?: number;
}

interface RzpWebhookEvent {
  event: string;
  payload: {
    subscription?: { entity: RzpSubscription };
    payment?: { entity: RzpPayment };
    invoice?: { entity: RzpInvoice };
  };
}

const STATUS_MAP: Record<string, "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" | "PAUSED"> = {
  authenticated: "TRIALING",
  active: "ACTIVE",
  halted: "PAST_DUE",
  pending: "PAST_DUE",
  cancelled: "CANCELED",
  completed: "CANCELED",
  paused: "PAUSED",
};

export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "MISSING_SIGNATURE" }, { status: 400 });
  }

  const raw = await req.text();
  let valid = false;
  try {
    valid = verifyWebhookSignature(raw, signature);
  } catch {
    return NextResponse.json({ error: "WEBHOOK_NOT_CONFIGURED" }, { status: 500 });
  }
  if (!valid) {
    return NextResponse.json({ error: "BAD_SIGNATURE" }, { status: 401 });
  }

  let event: RzpWebhookEvent;
  try {
    event = JSON.parse(raw) as RzpWebhookEvent;
  } catch {
    return NextResponse.json({ error: "BAD_JSON" }, { status: 400 });
  }

  const sub = event.payload.subscription?.entity;
  if (sub) {
    const mappedStatus = STATUS_MAP[sub.status ?? ""];
    const existing = await db.subscription.findUnique({
      where: { razorpaySubId: sub.id },
      include: {
        workspace: {
          include: {
            members: {
              where: { role: "OWNER" },
              include: { user: { select: { id: true } } },
              take: 1,
            },
          },
        },
      },
    });
    if (existing) {
      await db.subscription.update({
        where: { id: existing.id },
        data: {
          status: mappedStatus ?? existing.status,
          razorpayCustomerId: sub.customer_id ?? existing.razorpayCustomerId,
          currentPeriodStart: sub.current_start
            ? new Date(sub.current_start * 1000)
            : existing.currentPeriodStart,
          currentPeriodEnd: sub.current_end
            ? new Date(sub.current_end * 1000)
            : existing.currentPeriodEnd,
          cancelAtPeriodEnd:
            event.event === "subscription.cancelled"
              ? true
              : existing.cancelAtPeriodEnd,
        },
      });

      const ownerId = existing.workspace.members[0]?.user.id;
      if (ownerId) {
        if (event.event === "subscription.activated") {
          track(ownerId, "subscription_started", {
            plan: existing.plan,
            intervalMonths: 1,
          });
        } else if (event.event === "subscription.cancelled") {
          track(ownerId, "subscription_canceled", { plan: existing.plan });
        }
      }
    }
  }

  if (event.event === "subscription.payment.failed") {
    const subEntity = event.payload.subscription?.entity;
    if (subEntity) {
      const subRow = await db.subscription.findUnique({
        where: { razorpaySubId: subEntity.id },
        include: {
          workspace: {
            include: {
              members: {
                where: { role: "OWNER" },
                include: { user: { select: { id: true } } },
                take: 1,
              },
            },
          },
        },
      });
      const ownerId = subRow?.workspace.members[0]?.user.id;
      if (ownerId && subRow) {
        track(ownerId, "billing_payment_failed", { plan: subRow.plan });
      }
    }
  }

  if (event.event === "invoice.paid" || event.event === "payment.captured") {
    const payment = event.payload.payment?.entity;
    const invoice = event.payload.invoice?.entity;
    const subEntity = event.payload.subscription?.entity;
    if (payment) {
      const subRow = subEntity
        ? await db.subscription.findUnique({
            where: { razorpaySubId: subEntity.id },
            include: {
              workspace: {
                include: {
                  members: {
                    where: { role: "OWNER" },
                    include: {
                      user: { select: { id: true, email: true, name: true } },
                    },
                    take: 1,
                  },
                },
              },
            },
          })
        : null;
      const owner = subRow?.workspace.members[0]?.user;
      if (owner && subRow) {
        await enqueue("send-payment-receipt", {
          userId: owner.id,
          invoiceId: invoice?.id ?? payment.invoice_id ?? payment.id,
          plan: subRow.plan,
          amount: (payment.amount / 100).toFixed(2),
          currency: payment.currency.toUpperCase(),
          invoiceUrl: invoice?.short_url ?? "",
          periodStart: invoice?.period_start
            ? new Date(invoice.period_start * 1000).toISOString()
            : new Date().toISOString(),
          periodEnd: invoice?.period_end
            ? new Date(invoice.period_end * 1000).toISOString()
            : new Date().toISOString(),
        }).catch(() => {});
      }
    }
  }

  return NextResponse.json({ ok: true });
}
