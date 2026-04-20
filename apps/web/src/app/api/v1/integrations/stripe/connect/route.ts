import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

/**
 * Redirect to Stripe Connect OAuth to link the workspace's Stripe account.
 * We only read subscription data (read_only scope) - we do NOT charge.
 */
export async function GET(req: Request) {
  const session = await auth();
  const workspaceId = session?.user?.activeWorkspaceId;
  if (!session?.user?.id || !workspaceId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const clientId = process.env.STRIPE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "STRIPE_CLIENT_ID_NOT_SET" },
      { status: 500 },
    );
  }

  const origin = new URL(req.url).origin;
  const redirectUri = `${origin}/api/v1/integrations/stripe/callback`;
  const url = new URL("https://connect.stripe.com/oauth/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", "read_only");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", workspaceId);

  return NextResponse.redirect(url.toString());
}
