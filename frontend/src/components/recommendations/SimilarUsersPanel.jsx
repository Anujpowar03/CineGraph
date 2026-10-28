import { Users } from 'lucide-react';

/** Users whose liked/highly-rated movies overlap with yours (Jaccard similarity). */
export default function SimilarUsersPanel({ users }) {
  return (
    <section className="card p-5" aria-labelledby="similar-users-title">
      <h2 id="similar-users-title" className="flex items-center gap-2 font-sans text-sm font-semibold text-white">
        <Users className="h-4 w-4 text-signal-sky" aria-hidden="true" /> People with similar taste
      </h2>
      {users.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">
          No other user has liked or highly rated the same movies yet, so collaborative filtering is switched off for you.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {users.slice(0, 5).map((u) => (
            <li key={u.userId}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-100">{u.name}</span>
                <span className="tabular-nums text-xs text-slate-400">similarity {u.similarity.toFixed(2)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden="true">
                <div className="h-full rounded-full bg-signal-sky" style={{ width: `${Math.round(u.similarity * 100)}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-500">Both enjoyed: {u.sharedTitles.join(', ')}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
        Similarity = shared liked movies ÷ all movies either of you liked (Jaccard index).
      </p>
    </section>
  );
}
