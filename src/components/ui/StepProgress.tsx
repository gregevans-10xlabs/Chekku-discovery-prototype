interface Props {
  current: number;
  total: number;
  label?: string;
  names?: string[];
}

export function StepProgress({ current, total, label, names }: Props) {
  const pct = Math.min(100, Math.round(((current + 1) / total) * 100));
  return (
    <div className="px-4 pb-2 pt-1">
      {names && names.length > 0 ? (
        <div className="no-scrollbar mb-2 flex gap-1 overflow-x-auto text-[11px] font-medium">
          {names.map((n, i) => (
            <span
              key={n}
              className={
                "shrink-0 rounded-full px-2.5 py-1 " +
                (i === current
                  ? "bg-accent text-white"
                  : i < current
                    ? "bg-accent-soft text-accent"
                    : "bg-surface-2 text-muted-strong")
              }
            >
              {i + 1}. {n}
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>
          {label ?? "Step"} {current + 1} of {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
