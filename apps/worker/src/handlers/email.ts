import { db } from "@launchmint/db";
import {
  LaunchLiveEmail,
  LaunchReminderEmail,
  MagicLinkEmail,
  PaymentReceiptEmail,
  ReviewInviteEmail,
  WelcomeEmail,
  sendEmail,
} from "@launchmint/email";
import type { HandlerMap } from "@launchmint/queue";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://launchmint.com";

export const emailHandlers: HandlerMap = {
  "send-welcome-email": async (data) => {
    await sendEmail({
      to: data.email,
      subject: "Welcome to LaunchMint",
      template: WelcomeEmail({
        firstName: data.firstName,
        dashboardUrl: `${APP_URL}/app`,
      }),
      tags: [
        { name: "type", value: "welcome" },
        { name: "userId", value: data.userId },
      ],
    });
  },
  "send-magic-link": async (data) => {
    await sendEmail({
      to: data.email,
      subject: "Your LaunchMint sign-in link",
      template: MagicLinkEmail({
        url: data.url,
        expiresInMinutes: data.expiresInMinutes,
      }),
      tags: [{ name: "type", value: "magic-link" }],
    });
  },
  "send-payment-receipt": async (data) => {
    await sendEmail({
      to: data.userId,
      subject: `Receipt - ${data.plan}`,
      template: PaymentReceiptEmail({
        firstName: "there",
        plan: data.plan,
        amount: data.amount,
        currency: data.currency,
        invoiceId: data.invoiceId,
        invoiceUrl: data.invoiceUrl,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
      }),
      tags: [{ name: "type", value: "receipt" }],
    });
  },
  "send-launch-reminder": async (data) => {
    const launch = await db.launch.findUnique({
      where: { id: data.launchId },
      include: {
        product: {
          include: {
            workspace: {
              include: {
                founderProfile: { include: { user: true } },
              },
            },
          },
        },
      },
    });
    if (!launch) return;
    if (launch.status === "CANCELLED" || launch.status === "ENDED") return;

    const founder = launch.product.workspace.founderProfile;
    const recipientEmail = founder?.user.email;
    if (!recipientEmail) return;

    await sendEmail({
      to: recipientEmail,
      subject:
        data.daysOut === 1
          ? `Launch tomorrow: ${launch.product.name}`
          : `Launch in 3 days: ${launch.product.name}`,
      template: LaunchReminderEmail({
        firstName: founder?.displayName.split(" ")[0] ?? "there",
        productName: launch.product.name,
        daysOut: data.daysOut,
        scheduledFor: launch.scheduledAt.toISOString().slice(0, 16).replace("T", " ") + " UTC",
        checklistUrl: `${APP_URL}/app/launches`,
      }),
      tags: [
        { name: "type", value: "launch-reminder" },
        { name: "launchId", value: launch.id },
      ],
    });
  },
  "send-review-invite": async (data) => {
    const product = await db.product.findUnique({
      where: { id: data.productId },
      include: {
        workspace: {
          include: {
            founderProfile: { select: { displayName: true } },
          },
        },
      },
    });
    if (!product) return;

    const founderName =
      product.workspace.founderProfile?.displayName ?? product.name;
    await sendEmail({
      to: data.email,
      subject: `Could you review ${product.name}?`,
      template: ReviewInviteEmail({
        productName: product.name,
        founderName,
        reviewUrl: `${APP_URL}/review/${data.token}`,
        personalNote: data.personalNote,
      }),
      tags: [
        { name: "type", value: "review-invite" },
        { name: "productId", value: product.id },
      ],
    });
  },
  "send-launch-live": async (data) => {
    const launch = await db.launch.findUnique({
      where: { id: data.launchId },
      include: {
        product: {
          include: {
            workspace: {
              include: {
                founderProfile: { include: { user: true } },
              },
            },
          },
        },
      },
    });
    if (!launch) return;

    const founder = launch.product.workspace.founderProfile;
    const recipientEmail = founder?.user.email;
    if (!recipientEmail) return;

    await sendEmail({
      to: recipientEmail,
      subject: `${launch.product.name} is live`,
      template: LaunchLiveEmail({
        firstName: founder?.displayName.split(" ")[0] ?? "there",
        productName: launch.product.name,
        productUrl: `${APP_URL}/products/${launch.product.slug}`,
        leaderboardUrl: `${APP_URL}/today`,
      }),
      tags: [
        { name: "type", value: "launch-live" },
        { name: "launchId", value: launch.id },
      ],
    });
  },
};
