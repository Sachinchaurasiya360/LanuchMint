import type { UsageSummaryRow } from "@launchmint/billing";

export function UsageBar({ row }: { row: UsageSummaryRow }) {
  const percent = row.percent ?? 0;
  const over = row.limit !== null && row.used >= row.limit;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{row.label}</span>
        <span className="text-muted-foreground">
          {row.used.toLocaleString()} / {row.limit === null ? "∞" : row.limit.toLocaleString()}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-secondary">
        <div
          className={
            over
              ? "h-full bg-red-600"
              : percent > 80
                ? "h-full bg-amber-500"
                : "h-full bg-foreground"
          }
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}
