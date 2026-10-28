import { Compass, Info, Network, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { SkeletonBlock } from '../components/common/Skeleton.jsx';
import MovieCard from '../components/movies/MovieCard.jsx';
import GenrePicker from '../components/recommendations/GenrePicker.jsx';
import RecommendationCard from '../components/recommendations/RecommendationCard.jsx';
import SimilarUsersPanel from '../components/recommendations/SimilarUsersPanel.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { moviesApi, recommendationApi } from '../services/api.js';

const STRATEGIES = [
  { id: 'hybrid', label: 'Hybrid', description: 'All graph signals combined: genres, actors, directors, similar users and quality.' },
  { id: 'genre', label: 'Genre-based', description: 'Seed movie → Genre → candidate. Ranked by how much of your genre profile a movie covers.' },
  { id: 'people', label: 'Cast & crew', description: 'Seed movie ← Actor/Director → candidate. Each shared person counted once.' },
  { id: 'collaborative', label: 'Similar users', description: 'Seed movie ← similar user → candidate. Users weighted by Jaccard similarity.' },
];

const MODE_BADGES = {
  personalised: { text: 'Personalised', className: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' },
  'preference-based': { text: 'Preference-based (cold start)', className: 'border-amber-400/30 bg-amber-500/10 text-amber-200' },
  popular: { text: 'Popular picks · not personalised', className: 'border-sky-400/30 bg-sky-500/10 text-sky-200' },
  empty: { text: 'Needs more activity', className: 'border-white/15 bg-white/5 text-slate-300' },
};

/** Cold-start onboarding: choose genres, then like a few popular movies. */
function Onboarding({ preferredGenres, onSaved }) {
  const popular = useAsync(() => moviesApi.trending(10).then((r) => r.data), []);
  return (
    <section className="card space-y-8 p-6 sm:p-8">
      <div>
        <p className="eyebrow">Step 1</p>
        <h2 className="mt-1 text-xl font-semibold">Choose a few genres you enjoy</h2>
        <p className="mb-4 mt-1 text-sm text-slate-400">
          We store these as <code className="text-slate-300">(:User)-[:PREFERS]-&gt;(:Genre)</code> relationships and use them for your first recommendations.
        </p>
        <GenrePicker initial={preferredGenres} onSaved={onSaved} />
      </div>
      <div>
        <p className="eyebrow">Step 2</p>
        <h2 className="mt-1 text-xl font-semibold">Like a few movies you have enjoyed</h2>
        <p className="mb-4 mt-1 text-sm text-slate-400">Each like adds a LIKED relationship that unlocks actor, director and similar-user signals.</p>
        {popular.data && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {popular.data.map((m) => <MovieCard key={m.movieId} movie={m} showOverview={false} footer={null} />)}
          </div>
        )}
      </div>
    </section>
  );
}

export default function RecommendationsPage() {
  const { user, activityVersion } = useAuth();
  const [strategy, setStrategy] = useState('hybrid');
  const recs = useAsync(() => recommendationApi.get(strategy, 12).then((r) => r.data), [strategy, activityVersion]);
  const active = STRATEGIES.find((s) => s.id === strategy);
  const data = recs.data;
  const needsOnboarding = data && data.profile.seedCount === 0;

  return (
    <div className="container-page py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Recommendation dashboard</p>
          <h1 className="mt-1 text-3xl font-bold">Picked for {user.name.split(' ')[0]}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Every suggestion below is produced by Cypher traversals over your likes, ratings and preferences — open “Why this movie?” to
            see the exact relationships behind it.
          </p>
        </div>
        <Link to="/graph?user=me" className="btn-secondary">
          <Network className="h-4 w-4" aria-hidden="true" /> Explore my graph
        </Link>
      </header>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-ink-850 p-1 lg:w-fit" role="tablist" aria-label="Recommendation algorithm">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={strategy === s.id}
            onClick={() => setStrategy(s.id)}
            className={`btn shrink-0 px-4 py-2 ${strategy === s.id ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mt-3 flex items-start gap-2 text-sm text-slate-400">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" aria-hidden="true" /> {active.description}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <section aria-live="polite" aria-busy={recs.loading}>
          {recs.loading && !data ? (
            <div className="space-y-4">{Array.from({ length: 4 }, (_, i) => <SkeletonBlock key={i} className="h-44 w-full" />)}</div>
          ) : recs.error ? (
            <ErrorMessage error={recs.error} onRetry={recs.reload} />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className={`chip ${MODE_BADGES[data.mode]?.className}`}>{MODE_BADGES[data.mode]?.text}</span>
                {data.message && <p className="text-sm text-slate-400">{data.message}</p>}
              </div>
              {data.items.length === 0 ? (
                <EmptyState
                  icon={Compass}
                  title="No recommendations from this algorithm yet"
                  description={data.message || 'Interact with a few more movies and try again.'}
                  action={<button type="button" className="btn-secondary" onClick={() => setStrategy('hybrid')}>Show hybrid results</button>}
                />
              ) : (
                <ol className="space-y-4">
                  {data.items.map((item, i) => (
                    <li key={item.movieId}>
                      <RecommendationCard item={item} rank={i + 1} weights={data.weights} />
                    </li>
                  ))}
                </ol>
              )}
              {needsOnboarding && strategy === 'hybrid' && (
                <div className="mt-8">
                  <Onboarding preferredGenres={data.profile.preferredGenres} onSaved={recs.reload} />
                </div>
              )}
            </>
          )}
        </section>

        <aside className="space-y-6">
          {data && (
            <>
              <section className="card p-5" aria-labelledby="profile-title">
                <h2 id="profile-title" className="flex items-center gap-2 font-sans text-sm font-semibold text-white">
                  <Sparkles className="h-4 w-4 text-accent-soft" aria-hidden="true" /> Your taste profile
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="label">Seed movies ({data.profile.seedCount})</dt>
                    <dd className="text-slate-300">
                      {data.profile.seedCount
                        ? data.profile.seedMovies.map((s) => `${s.title}${s.liked ? ' ♥' : ` ${s.rating}★`}`).join(', ')
                        : 'None yet — like or rate 4★+ to add seeds.'}
                    </dd>
                  </div>
                  <div>
                    <dt className="label">Preferred genres</dt>
                    <dd className="text-slate-300">{data.profile.preferredGenres.map((g) => g.name).join(', ') || 'None selected'}</dd>
                  </div>
                  <div>
                    <dt className="label">Excluded (already seen)</dt>
                    <dd className="text-slate-300">{data.profile.consumedCount} movies you liked, rated or watched</dd>
                  </div>
                </dl>
                {data.weights && (
                  <div className="mt-4 border-t border-white/[0.06] pt-4">
                    <p className="label">Weights used for you</p>
                    <ul className="space-y-1 text-xs text-slate-400">
                      {Object.entries(data.weights).map(([k, w]) => (
                        <li key={k} className="flex justify-between">
                          <span className="capitalize">{k}</span>
                          <span className="tabular-nums">{w ? w.toFixed(2) : 'not used'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
              {(strategy === 'hybrid' || strategy === 'collaborative') && <SimilarUsersPanel users={data.similarUsers || []} />}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
