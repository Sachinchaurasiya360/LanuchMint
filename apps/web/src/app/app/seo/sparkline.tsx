interface SparklineProps {
  values: (number | null)[];
  width?: number;
  height?: number;
  strokeClassName?: string;
}

export function Sparkline({
  values,
  width = 120,
  height = 32,
  strokeClassName = "stroke-foreground",
}: SparklineProps) {
  const clean = values.map((v) => (typeof v === "number" && Number.isFinite(v) ? v : null));
  const numeric = clean.filter((v): v is number => v !== null);
  if (numeric.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="No data yet"
        className="opacity-40"
      >
        <line
          x1="0"
          y1={height - 1}
          x2={width}
          y2={height - 1}
          className="stroke-muted-foreground"
          strokeDasharray="2,3"
        />
      </svg>
    );
  }

  const min = Math.min(...numeric);
  const max = Math.max(...numeric);
  const range = max - min || 1;
  const step = width / Math.max(1, clean.length - 1);

  const points = clean
    .map((v, i) => {
      if (v === null) return null;
      const y = height - ((v - min) / range) * height;
      return `${(i * step).toFixed(2)},${y.toFixed(2)}`;
    })
    .filter((p): p is string => p !== null)
    .join(" ");

  return (
    <svg width={width} height={height} role="img" aria-label="Trend">
      <polyline
        fill="none"
        strokeWidth="1.5"
        className={strokeClassName}
        points={points}
      />
    </svg>
  );
}
