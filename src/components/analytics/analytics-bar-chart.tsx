type Point = { label: string; value: number; hint?: string };

export function AnalyticsBarChart({
  title,
  points,
  valueLabel,
}: {
  title: string;
  points: Point[];
  /** Affiché sous la barre la plus haute ou en légende */
  valueLabel?: string;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const maxBarPx = 120;

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-gray-800">{title}</p>
      <div className="flex h-[140px] items-end gap-0.5 sm:gap-1">
        {points.map((p) => {
          const hPx = p.value <= 0 ? 0 : Math.max(4, Math.round((p.value / max) * maxBarPx));
          return (
            <div key={p.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <div
                className="w-full max-w-[2.5rem] rounded-t bg-primary-500 transition-all sm:max-w-none"
                style={{ height: `${hPx}px` }}
                title={p.hint ?? `${p.value}`}
              />
              <span className="w-full truncate text-center text-[9px] text-gray-500 sm:text-[10px]">
                {p.label}
              </span>
            </div>
          );
        })}
      </div>
      {valueLabel ? <p className="mt-2 text-xs text-gray-400">{valueLabel}</p> : null}
    </div>
  );
}
