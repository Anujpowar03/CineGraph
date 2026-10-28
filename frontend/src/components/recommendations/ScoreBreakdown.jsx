const LABELS = {
  genre: 'Genre match',
  actor: 'Shared actors',
  director: 'Shared director',
  collaborative: 'Similar users',
  rating: 'Quality (rating)',
};
const COLORS = {
  genre: 'bg-signal-teal',
  actor: 'bg-signal-amber',
  director: 'bg-signal-rose',
  collaborative: 'bg-signal-sky',
  rating: 'bg-accent-soft',
};

/**
 * One bar per score component (0..1) with the weight actually used for this
 * user. "n/a" means the component could not be computed and its weight was
 * redistributed to the others.
 */
export default function ScoreBreakdown({ components, weights }) {
  return (
    <dl className="space-y-2">
      {Object.keys(LABELS).map((key) => {
        const value = components?.[key];
        const weight = weights?.[key];
        const unavailable = value === null || value === undefined;
        return (
          <div key={key} className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-2 text-xs">
            <dt className="text-slate-400">
              {LABELS[key]}
              {weight > 0 && <span className="ml-1 text-slate-600">×{weight.toFixed(2)}</span>}
            </dt>
            <dd className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden="true">
              {!unavailable && <div className={`h-full rounded-full ${COLORS[key]}`} style={{ width: `${Math.round(value * 100)}%` }} />}
            </dd>
            <dd className="text-right tabular-nums text-slate-300">{unavailable ? 'n/a' : value.toFixed(2)}</dd>
          </div>
        );
      })}
    </dl>
  );
}
