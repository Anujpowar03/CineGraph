import { ArrowLeft, Clock, Eye, Network, Star, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import SectionHeader from '../components/common/SectionHeader.jsx';
import FavoriteButton from '../components/movies/FavoriteButton.jsx';
import GenreBadge from '../components/movies/GenreBadge.jsx';
import Poster from '../components/movies/Poster.jsx';
import RatingStars from '../components/movies/RatingStars.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { moviesApi, userApi } from '../services/api.js';
import { formatDate, formatRating, formatRuntime } from '../utils/format.js';

export default function MovieDetailsPage() {
  const { movieId } = useParams();
  const { user, markActivity } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const movie = useAsync(() => moviesApi.get(movieId).then((r) => r.data), [movieId, user?.userId]);
  const related = useAsync(() => moviesApi.related(movieId, 8).then((r) => r.data), [movieId]);
  const [userState, setUserState] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUserState(movie.data?.userState ?? null);
    if (movie.data) document.title = `${movie.data.title} (${movie.data.releaseYear}) · CineGraph`;
    return () => {
      document.title = 'CineGraph — Discover Movies Through Connections';
    };
  }, [movie.data]);

  const requireLogin = () => {
    toast.info('Sign in to rate movies and track what you watch.');
    navigate('/login', { state: { from: location.pathname } });
  };

  const rate = async (rating) => {
    if (!user) return requireLogin();
    setBusy(true);
    try {
      await userApi.rate(movieId, rating);
      setUserState((s) => ({ ...s, rating }));
      markActivity();
      toast.success(`Rated ${movie.data.title} ${rating}★`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const clearRating = async () => {
    setBusy(true);
    try {
      await userApi.removeRating(movieId);
      setUserState((s) => ({ ...s, rating: null }));
      markActivity();
      toast.info('Rating removed');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const markWatched = async () => {
    if (!user) return requireLogin();
    setBusy(true);
    try {
      const res = await userApi.watch(movieId);
      setUserState((s) => ({ ...s, watchedAt: res.data.watchedAt, watchCount: res.data.watchCount }));
      markActivity();
      toast.success('Added to your watch history');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  if (movie.loading) return <LoadingSpinner label="Loading movie…" className="py-32" />;
  if (movie.error) {
    return (
      <div className="container-page py-16">
        <ErrorMessage error={movie.error} onRetry={movie.error.status === 404 ? undefined : movie.reload} title={movie.error.status === 404 ? 'Movie not found' : undefined} />
        <div className="mt-6 text-center"><Link to="/explore" className="btn-secondary">Back to the catalogue</Link></div>
      </div>
    );
  }

  const m = movie.data;
  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 scale-110 opacity-50 blur-3xl" aria-hidden="true">
          <Poster movie={m} showTitle={false} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/85 to-ink-900/50" aria-hidden="true" />

        <div className="container-page relative py-8 sm:py-12">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost mb-6 px-2">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </button>
          <div className="grid gap-8 md:grid-cols-[16rem_1fr]">
            <div className="mx-auto aspect-[2/3] w-52 overflow-hidden rounded-2xl border border-white/10 shadow-glow md:w-full">
              <Poster movie={m} size="w500" />
            </div>
            <div>
              <h1 className="text-balance text-3xl font-bold sm:text-4xl">{m.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
                <span>{m.releaseYear}</span>
                {m.runtime && (
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden="true" /> {formatRuntime(m.runtime)}</span>
                )}
                <span className="flex items-center gap-1 text-amber-300" title="Approximate catalogue rating (0-10)">
                  <Star className="h-4 w-4 fill-current" aria-hidden="true" /> {formatRating(m.rating)}<span className="text-slate-500">/10</span>
                </span>
                <span className="flex items-center gap-1" title="Average rating from CineGraph users">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  {m.ratingCount ? `${m.communityRating.toFixed(1)}/5 from ${m.ratingCount} user${m.ratingCount === 1 ? '' : 's'}` : 'No user ratings yet'}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {m.genres.map((g) => <GenreBadge key={g.genreId} name={g.name} genreId={g.genreId} link />)}
              </div>
              <p className="mt-5 max-w-2xl leading-relaxed text-slate-200">{m.overview}</p>

              <dl className="mt-6 grid max-w-2xl gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="label">{m.directors.length > 1 ? 'Directors' : 'Director'}</dt>
                  <dd className="text-white">{m.directors.map((d) => d.name).join(', ')}</dd>
                </div>
                <div>
                  <dt className="label">Community</dt>
                  <dd className="text-slate-300">{m.likeCount} likes · {m.watchCount} watched</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <FavoriteButton movie={m} variant="button" />
                <button type="button" className="btn-secondary" onClick={markWatched} disabled={busy}>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  {userState?.watchCount ? `Watched ${userState.watchCount}×` : 'Mark as watched'}
                </button>
                <Link to={`/graph?movie=${m.movieId}`} className="btn-secondary">
                  <Network className="h-4 w-4" aria-hidden="true" /> Explore connections
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 sm:w-fit">
                <span className="text-sm text-slate-300">Your rating</span>
                <RatingStars value={userState?.rating || 0} onRate={rate} disabled={busy} label={`Rate ${m.title}`} />
                {userState?.rating ? (
                  <button type="button" onClick={clearRating} className="btn-ghost px-2 py-1 text-xs" disabled={busy}>
                    <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear
                  </button>
                ) : (
                  !user && <span className="text-xs text-slate-500">Sign in to rate</span>
                )}
                {userState?.watchedAt && <span className="text-xs text-slate-500">Last watched {formatDate(userState.watchedAt)}</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page space-y-12 py-10">
        <section aria-labelledby="cast-title">
          <h2 id="cast-title" className="mb-4 text-xl font-semibold">Cast</h2>
          <ul className="flex flex-wrap gap-2">
            {m.cast.map((a) => (
              <li key={a.actorId} className="card flex items-center gap-2.5 px-3 py-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-signal-amber/15 text-xs font-bold text-signal-amber" aria-hidden="true">
                  {a.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </span>
                <span className="text-sm text-slate-100">{a.name}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-500">Principal cast in billing order (sample data, not the complete credits).</p>
        </section>

        <section>
          <SectionHeader eyebrow="Connected through the graph" title="Related movies" description="Found by walking shared Genre, Actor and Director nodes" />
          {related.loading ? (
            <LoadingSpinner label="Finding related movies…" />
          ) : related.error ? (
            <ErrorMessage error={related.error} onRetry={related.reload} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.data.map((r) => (
                <Link key={r.movieId} to={`/movies/${r.movieId}`} className="card group flex gap-3 p-3 transition hover:border-accent/40">
                  <div className="aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-lg">
                    <Poster movie={r} showTitle={false} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white group-hover:text-accent-soft">{r.title}</p>
                    <p className="text-xs text-slate-500">{r.releaseYear} · relevance {Math.round(r.relatedScore * 100)}%</p>
                    <ul className="mt-2 space-y-1">
                      {r.reasons.slice(0, 3).map((reason) => (
                        <li key={reason} className="line-clamp-2 text-xs text-slate-400">{reason}</li>
                      ))}
                    </ul>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
