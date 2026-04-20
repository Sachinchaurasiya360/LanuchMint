import Link from "next/link";
import { db } from "@launchmint/db";
import { requirePermission } from "@launchmint/auth";
import { Badge, EmptyState } from "@launchmint/ui";
import { FileClock } from "lucide-react";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type SearchParams = { action?: string; actor?: string };

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { ctx } = await requireSession();
  requirePermission(ctx, "admin.audit");

  const actionFilter = (searchParams.action ?? "").trim().slice(0, 80);
  const actorFilter = (searchParams.actor ?? "").trim().slice(0, 40);

  const rows = await db.auditLog.findMany({
    where: {
      ...(actionFilter ? { action: { startsWith: actionFilter } } : {}),
      ...(actorFilter ? { actorId: actorFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { name: true, email: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every admin mutation, newest first.
        </p>
      </header>

      <form className="mt-6 flex flex-wrap gap-2" action="/app/admin/audit">
        <input
          name="action"
          defaultValue={actionFilter}
          placeholder="Action prefix (e.g. moderation.review)"
          className="h-9 w-72 rounded-md border px-3 text-sm"
        />
        <input
          name="actor"
          defaultValue={actorFilter}
          placeholder="Actor ID"
          className="h-9 w-56 rounded-md border px-3 text-sm"
        />
        <button
          type="submit"
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-secondary/40"
        >
          Filter
        </button>
        {actionFilter || actorFilter ? (
          <Link
            href="/app/admin/audit"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {rows.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={FileClock}
            title="No audit entries"
            description="Admin actions will appear here as they happen."
          />
        </div>
      ) : (
        <ul className="mt-6 divide-y rounded-lg border text-sm">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start gap-4 p-4">
              <div className="w-40 text-xs text-muted-foreground">
                {r.createdAt.toISOString().replace("T", " ").slice(0, 19)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{r.action}</Badge>
                  {r.target ? (
                    <span className="text-xs text-muted-foreground">
                      {r.target}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  by{" "}
                  <span className="text-foreground">
                    {r.actor?.name ?? r.actor?.email ?? r.actorId ?? "system"}
                  </span>
                  {r.ipAddress ? (
                    <span className="ml-2">from {r.ipAddress}</span>
                  ) : null}
                </p>
                {r.metadata ? (
                  <pre className="mt-2 overflow-x-auto rounded-md bg-secondary/40 p-2 text-[11px] text-muted-foreground">
                    {JSON.stringify(r.metadata, null, 2)}
                  </pre>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
