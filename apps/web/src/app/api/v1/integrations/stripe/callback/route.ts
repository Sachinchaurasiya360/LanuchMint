import { NextResponse } from "next/server";
import { db } from "@launchmint/db";
import { enqueue } from "@launchmint/queue";
import { auth } from "@/auth";

export const runtime = "nodejs";

interface TokenResponse {
  stripe_user_id?: string;
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/app/billing?stripe_error=${encodeURIComponent(error)}`, url),
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL("/app/billing?stripe_error=missing_code", url));
  }

  const session = await auth();
  if (!session?.user?.id || session.user.activeWorkspaceId !== state) {
    return NextResponse.redirect(new URL("/signin", url));
  }

  const secret = process.env.STRIPE_CLIENT_SECRET;
  if (!secret) {
    return NextResponse.redirect(
      new URL("/app/billing?stripe_error=server_misconfigured", url),
    );
  }

  const res = await fetch("https://connect.stripe.com/oauth/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_secret: secret,
      code,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as TokenResponse;
  if (!res.ok || !data.stripe_user_id) {
    return NextResponse.redirect(
      new URL(
        `/app/billing?stripe_error=${encodeURIComponent(data.error ?? "token_exchange_failed")}`,
        url,
      ),
    );
  }

  await db.integration.upsert({
    where: { workspaceId_type: { workspaceId: state, type: "STRIPE" } },
    create: {
      workspaceId: state,
      type: "STRIPE",
      externalId: data.stripe_user_id,
      accessToken: data.access_token ?? null,
      refreshToken: data.refresh_token ?? null,
      metadata: { scope: data.scope ?? "read_only" },
    },
    update: {
      externalId: data.stripe_user_id,
      accessToken: data.access_token ?? null,
      refreshToken: data.refresh_token ?? null,
      metadata: { scope: data.scope ?? "read_only" },
    },
  });

  // Immediately enqueue an MRR pull for every product in this workspace so
  // the badge shows up within minutes rather than waiting for the daily tick.
  const products = await db.product.findMany({
    where: { workspaceId: state, deletedAt: null },
    select: { id: true },
  });
  for (const p of products) {
    await enqueue("verify-mrr", { productId: p.id }).catch(() => {});
  }

  return NextResponse.redirect(new URL("/app/billing?stripe_connected=1", url));
}
