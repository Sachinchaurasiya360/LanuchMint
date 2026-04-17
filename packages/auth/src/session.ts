import { db } from "@launchmint/db";
import type { AuthContext } from "./rbac.js";

/**
 * Build the AuthContext for a given user + active workspace.
 * Used by API handlers to pass into `can()` / `requirePermission()`.
 */
export async function buildAuthContext(
  userId: string,
  workspaceId?: string,
): Promise<AuthContext> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, isSuperAdmin: true, isModerator: true },
  });

  if (!user) {
    throw new Error("UNAUTHORIZED: user not found");
  }

  let workspace: AuthContext["workspace"];
  if (workspaceId) {
    const member = await db.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
      select: { role: true, workspaceId: true },
    });
    if (member) {
      workspace = { id: member.workspaceId, role: member.role };
    }
  }

  return { user, workspace };
}

/**
 * Resolve the user's default workspace.
 * Used at sign-in and as a fallback for missing X-Workspace-Id header.
 */
export async function getDefaultWorkspaceId(userId: string): Promise<string | null> {
  const member = await db.workspaceMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: "asc" },
    select: { workspaceId: true },
  });
  return member?.workspaceId ?? null;
}
