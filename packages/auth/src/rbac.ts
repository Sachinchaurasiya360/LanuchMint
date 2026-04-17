/**
 * Role-based access control.
 *
 * permission = role.permissions ∩ workspace.scope ∩ resource.ownership
 */
import type { Role } from "@launchmint/db";

export type Action =
  | "product.create"
  | "product.read"
  | "product.update"
  | "product.delete"
  | "launch.schedule"
  | "review.create"
  | "review.reply"
  | "review.delete"
  | "comment.create"
  | "comment.delete"
  | "directory.submit"
  | "seo.read"
  | "seo.write"
  | "billing.manage"
  | "team.invite"
  | "team.remove"
  | "agency.manage_clients"
  | "moderation.queue"
  | "moderation.decide"
  | "admin.impersonate"
  | "admin.badge"
  | "admin.audit";

export interface AuthContext {
  user: {
    id: string;
    isSuperAdmin: boolean;
    isModerator: boolean;
  };
  workspace?: {
    id: string;
    role: Role;
  };
}

const ROLE_PERMISSIONS: Record<Role, Action[]> = {
  OWNER: [
    "product.create",
    "product.read",
    "product.update",
    "product.delete",
    "launch.schedule",
    "review.create",
    "review.reply",
    "review.delete",
    "comment.create",
    "comment.delete",
    "directory.submit",
    "seo.read",
    "seo.write",
    "billing.manage",
    "team.invite",
    "team.remove",
  ],
  FOUNDER: [
    "product.create",
    "product.read",
    "product.update",
    "product.delete",
    "launch.schedule",
    "review.reply",
    "comment.create",
    "directory.submit",
    "seo.read",
    "seo.write",
  ],
  TEAM_MEMBER: [
    "product.read",
    "product.update",
    "review.reply",
    "comment.create",
    "directory.submit",
    "seo.read",
  ],
  AGENCY_OPERATOR: [
    "product.create",
    "product.read",
    "product.update",
    "product.delete",
    "launch.schedule",
    "review.reply",
    "comment.create",
    "directory.submit",
    "seo.read",
    "seo.write",
    "agency.manage_clients",
  ],
  CLIENT_VIEWER: ["product.read", "comment.create", "seo.read"],
  INVESTOR: ["product.read", "comment.create"],
};

const ADMIN_ACTIONS: Action[] = [
  "moderation.queue",
  "moderation.decide",
  "admin.impersonate",
  "admin.badge",
  "admin.audit",
  "review.delete",
  "comment.delete",
  "product.delete",
];

const MOD_ACTIONS: Action[] = [
  "moderation.queue",
  "moderation.decide",
  "admin.badge",
  "review.delete",
  "comment.delete",
];

/**
 * Returns true if the auth context can perform `action`.
 * Pass `resourceOwnerId` for ownership-gated actions (defaults to allow if role permits).
 */
export function can(ctx: AuthContext, action: Action, resourceOwnerId?: string): boolean {
  if (ctx.user.isSuperAdmin) return true;
  if (ctx.user.isModerator && MOD_ACTIONS.includes(action)) return true;
  if (ADMIN_ACTIONS.includes(action) && !ctx.user.isSuperAdmin) return false;

  if (!ctx.workspace) return false;

  const allowed = ROLE_PERMISSIONS[ctx.workspace.role] ?? [];
  if (!allowed.includes(action)) return false;

  if (resourceOwnerId && resourceOwnerId !== ctx.workspace.id) {
    return false;
  }

  return true;
}

export function requirePermission(
  ctx: AuthContext,
  action: Action,
  resourceOwnerId?: string,
): void {
  if (!can(ctx, action, resourceOwnerId)) {
    const err = new Error(`FORBIDDEN: ${action}`);
    (err as Error & { code?: string }).code = "FORBIDDEN";
    throw err;
  }
}
