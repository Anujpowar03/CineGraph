import { Clapperboard, Drama, Tags, Users } from 'lucide-react';
import ScoreBreakdown from './ScoreBreakdown.jsx';

/** Expanded "why?" panel: evidence returned by the graph queries, nothing else. */
export default function RecommendationExplanation({ item, weights }) {
  return (
    <div className="space-y-4 border-t border-white/[0.06] pt-4">
      {item.reasons?.length > 0 && (
        <ul className="space-y-1.5 text-sm text-slate-300">
          {item.reasons.map((reason) => (
            <li key={reason} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-soft" aria-hidden="true" />
              {reason}
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-3 text-xs sm:grid-cols-2">
        {item.sharedGenres?.length > 0 && (
          <Evidence icon={Tags} title="Shared genres" color="text-signal-teal">
            {item.sharedGenres.join(', ')}
          </Evidence>
        )}
        {item.sharedDirectors?.length > 0 && (
          <Evidence icon={Clapperboard} title="Shared directors" color="text-signal-rose">
            {item.sharedDirectors.map((d) => `${d.name} (${d.via.join(', ')})`).join('; ')}
          </Evidence>
        )}
        {item.sharedActors?.length > 0 && (
          <Evidence icon={Drama} title="Shared actors" color="text-signal-amber">
            {item.sharedActors.map((a) => `${a.name} (${a.via.join(', ')})`).join('; ')}
          </Evidence>
        )}
        {item.similarUserCount > 0 && (
          <Evidence icon={Users} title="Similar-user evidence" color="text-signal-sky">
            {item.similarUserCount} similar {item.similarUserCount === 1 ? 'user' : 'users'} liked or rated it 4★+
          </Evidence>
        )}
      </div>

      {item.components && (
        <div>
          <p className="label">Score breakdown</p>
          <ScoreBreakdown components={item.components} weights={weights} />
        </div>
      )}
    </div>
  );
}

function Evidence({ icon: Icon, title, color, children }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className={`mb-1 flex items-center gap-1.5 font-semibold ${color}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {title}
      </p>
      <p className="leading-relaxed text-slate-300">{children}</p>
    </div>
  );
}
