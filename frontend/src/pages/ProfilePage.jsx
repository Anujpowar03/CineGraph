import { Eye, Heart, Network, Star, Tags } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import MovieGrid from '../components/movies/MovieGrid.jsx';
import RatingStars from '../components/movies/RatingStars.jsx';
import GenrePicker from '../components/recommendations/GenrePicker.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { userApi } from '../services/api.js';
import { formatDate } from '../utils/format.js';

const TABS = [
  { id: 'favorites', label: 'Favourites', icon: Heart },
  { id: 'ratings', label: 'Ratings', icon: Star },
  { id: 'history', label: 'Watch history', icon: Eye },
];

export default function ProfilePage() {
  const { user, activityVersion } = useAuth();
  const [tab, setTab] = useState('favorites');
  const profile = useAsync(() => userApi.profile().then((r) => r.data), [activityVersion]);
  const list = useAsync(
    () => (tab === 'favorites' ? userApi.favorites() : tab === 'ratings' ? userApi.ratings() : userApi.history()).then((r) => r.data),
    [tab, activityVersion],
  );

  if (profile.loading && !profile.data) return <LoadingSpinner label="Loading your profile…" className="py-32" />;
  if (profile.error) return <div className="container-page py-16"><ErrorMessage error={profile.error} onRetry={profile.reload} /></div>;

  const { stats, topGenres, preferences } = profile.data;
  const STAT_CARDS = [
    { label: 'Liked', value: stats.likes, icon: Heart },
    { label: 'Rated', value: stats.ratings, icon: Star },
    { label: 'Watched', value: stats.watched, icon: Eye },
    { label: 'Preferred genres', value: stats.preferredGenres, icon: Tags },
  ];

  return (
    <div className="container-page space-y-10 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/20 font-display text-2xl font-bold text-accent-soft">
            {user.name.charAt(0)}
          </span>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-slate-400">{user.email} · member since {formatDate(user.createdAt)}</p>
          </div>
        </div>
        <Link to="/graph?user=me" className="btn-secondary">
          <Network className="h-4 w-4" aria-hidden="true" /> View my graph
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Your activity">
        {STAT_CARDS.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-4">
            <Icon className="h-4 w-4 text-accent-soft" aria-hidden="true" />
            <p className="mt-3 font-display text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="card p-5">
          <h2 className="font-sans text-sm font-semibold text-white">Favourite genres (from your activity)</h2>
          <p className="mt-1 text-xs text-slate-500">Genres of movies you liked or rated 4★+, each movie counted once.</p>
          {topGenres.length ? (
            <ul className="mt-4 space-y-2">
              {topGenres.map((g) => (
                <li key={g.genre} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-2 text-sm">
                  <span className="text-slate-300">{g.genre}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden="true">
                    <span className="block h-full rounded-full bg-signal-teal" style={{ width: `${(g.movies / topGenres[0].movies) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums text-slate-400">{g.movies}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Like or rate movies to see your genre profile.</p>
          )}
        </div>
        <div className="card p-5">
          <h2 className="mb-1 font-sans text-sm font-semibold text-white">Preferred genres</h2>
          <p className="mb-4 text-xs text-slate-500">Stored as PREFERS relationships and used to boost matching genres.</p>
          <GenrePicker initial={preferences} onSaved={() => profile.reload()} compact />
        </div>
      </section>

      <section>
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-ink-850 p-1 sm:w-fit" role="tablist" aria-label="Your movies">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`btn shrink-0 px-4 py-2 ${tab === id ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
        <div role="tabpanel">
          {list.loading ? (
            <LoadingSpinner />
          ) : list.error ? (
            <ErrorMessage error={list.error} onRetry={list.reload} />
          ) : list.data.length === 0 ? (
            <EmptyState
              icon={TABS.find((t) => t.id === tab).icon}
              title={tab === 'favorites' ? 'No favourites yet' : tab === 'ratings' ? 'No ratings yet' : 'Nothing watched yet'}
              description="Open any movie to like it, rate it or mark it as watched."
              action={<Link to="/explore" className="btn-primary">Explore movies</Link>}
            />
          ) : (
            <MovieGrid
              movies={list.data}
              showOverview={false}
              renderFooter={(m) =>
                tab === 'ratings' ? (
                  <div className="mt-2"><RatingStars value={m.userRating} size="h-3.5 w-3.5" /></div>
                ) : tab === 'history' ? (
                  <p className="mt-2 text-xs text-slate-500">Watched {formatDate(m.watchedAt)}{m.watchCount > 1 ? ` · ${m.watchCount}×` : ''}</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">Liked {formatDate(m.likedAt)}</p>
                )
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}
