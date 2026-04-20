import { headers } from "next/headers";
import { db } from "@launchmint/db";

export interface AuditInput {
  actorId: string;
  workspaceId?: string | null;
  action: string;
  target?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Record a moderator/admin mutation. Captures IP + UA from the current
 * request headers so the audit trail is traceable even when actions run
 * inside server actions (no direct Request object).
 */
export async function recordAudit(input: AuditInput): Promise<void> {
  let ipAddress: string | undefined;
  let userAgent: string | undefined;
  try {
    const h = headers();
    ipAddress =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      undefined;
    userAgent = h.get("user-agent") ?? undefined;
  } catch {
    // headers() throws outside a request context - log without it.
  }
  await db.auditLog.create({
    data: {
      actorId: input.actorId,
      workspaceId: input.workspaceId ?? null,
      action: input.action,
      target: input.target ?? null,
      metadata: (input.metadata ?? undefined) as never,
      ipAddress,
      userAgent,
    },
  });
}
