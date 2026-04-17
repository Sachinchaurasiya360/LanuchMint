import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { buildAuthContext, type AuthContext } from "@launchmint/auth";

export interface ActiveSession {
  ctx: AuthContext;
  userId: string;
  workspaceId: string;
}

/**
 * Resolve the signed-in user + their active workspace.
 * Redirects to /signin if no session, /onboarding if no workspace.
 */
export async function requireSession(): Promise<ActiveSession> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }
  const userId = session.user.id;
  const workspaceId = session.user.activeWorkspaceId;
  if (!workspaceId) {
    redirect("/app/onboarding");
  }
  const ctx = await buildAuthContext(userId, workspaceId);
  return { ctx, userId, workspaceId };
}
