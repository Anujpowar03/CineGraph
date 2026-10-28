import { ArrowRight, Network, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import SectionHeader from '../components/common/SectionHeader.jsx';
import { SkeletonBlock } from '../components/common/Skeleton.jsx';
import FeaturedCarousel from '../components/movies/FeaturedCarousel.jsx';
import MovieRow from '../components/movies/MovieRow.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { moviesApi, recommendationApi } from '../services/api.js';

function RowSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 6 }, (_, i) => (
        <SkeletonBlock key={i} className="aspect-[2/3] w-[42%] shrink-0 sm:w-[28%] md:w-[22%] lg:w-[17.5%]" />
      ))}
    </div>
  );
}

function Row({ state, label, empty }) {
  if (state.loading) return <RowSkeleton />;
  if (state.error) return <ErrorMessage error={state.error} onRetry={state.reload} />;
  if (!state.data?.length) return <p className="text-sm text-slate-400">{empty}</p>;
  return <MovieRow movies={state.data} label={label} />;
}

export default function HomePage() {
  const { user, activityVersion } = useAuth();
  const trending = useAsync(() => moviesApi.trending(10).then((r) => r.data), []);
  const topRated = useAsync(() => moviesApi.list({ sort: 'rating', order: 'desc', limit: 12 }).then((r) => r.data), []);
  const recent = useAsync(() => moviesApi.list({ sort: 'added', order: 'desc', limit: 12 }).then((r) => r.data), []);
  const genres = useAsync(() => moviesApi.genres().then((r) => r.data), []);
  const forYou = useAsync(
    () => recommendationApi.get('hybrid', 12).then((r) => r.data),
    [user?.userId, activityVersion],
    { enabled: Boolean(user) },
  );

  return (
    <div className="container-page space-y-14 py-8">
      {trending.loading ? (
        <SkeletonBlock className="h-[380px] w-full rounded-3xl" />
      ) : trending.error ? (
        <ErrorMessage error={trending.error} onRetry={trending.reload} title="Could not load CineGraph" />
      ) : (
        <FeaturedCarousel movies={trending.data.slice(0, 5)} />
      )}

      {!user && (
        <section className="card grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow">Discover Movies Through Connections</p>
            <h2 className="mt-2 text-2xl font-semibold">Recommendations you can actually explain</h2>
            <p className="mt-2 max-w-2xl text-slate-400">
              CineGraph stores users, movies, genres, actors and directors as a Neo4j graph. Like a few films and it walks the
              relationships to find what to watch next — and tells you exactly why.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/login" className="btn-primary"><Sparkles className="h-4 w-4" aria-hidden="true" /> Try a demo account</Link>
            <Link to="/graph" className="btn-secondary"><Network className="h-4 w-4" aria-hidden="true" /> See the graph</Link>
          </div>
        </section>
      )}

      {user && (
        <section>
          <SectionHeader
            eyebrow="Personalised"
            title={`Recommended for ${user.name.split(' ')[0]}`}
            description={forYou.data?.message || 'Ranked by the hybrid graph recommender'}
            to="/recommendations"
            linkLabel="Why these?"
          />
          {forYou.loading ? <RowSkeleton /> : forYou.error ? (
            <ErrorMessage error={forYou.error} onRetry={forYou.reload} />
          ) : forYou.data?.items.length ? (
            <MovieRow movies={forYou.data.items} label="Recommended for you" />
          ) : (
            <p className="text-sm text-slate-400">
              Nothing yet — <Link className="text-accent-soft hover:underline" to="/recommendations">pick a few genres</Link> to get started.
            </p>
          )}
        </section>
      )}

      <section>
        <SectionHeader eyebrow="Trending" title="Most engaged on CineGraph" description="Movies with the most users who liked, rated or watched them" to="/explore?sort=popularity" />
        <Row state={trending} label="Trending movies" empty="No activity yet." />
      </section>

      <section>
        <SectionHeader eyebrow="Top rated" title="Highest rated" to="/explore?sort=rating" />
        <Row state={topRated} label="Highest rated movies" empty="No movies found." />
      </section>

      <section>
        <SectionHeader eyebrow="Genres" title="Popular genres" description="Each genre is a node connected to its movies" />
        {genres.loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }, (_, i) => <SkeletonBlock key={i} className="h-20" />)}
          </div>
        ) : genres.error ? (
          <ErrorMessage error={genres.error} onRetry={genres.reload} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[...genres.data].sort((a, b) => b.movieCount - a.movieCount).map((g) => (
              <Link
                key={g.genreId}
                to={`/explore?genre=${g.genreId}`}
                className="card group flex items-center justify-between p-4 transition hover:-translate-y-0.5 hover:border-accent/40"
              >
                <div>
                  <p className="font-semibold text-white">{g.name}</p>
                  <p className="text-xs text-slate-400">{g.movieCount} movies</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-accent-soft" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader eyebrow="New in the catalogue" title="Recently added" to="/explore?sort=added" />
        <Row state={recent} label="Recently added movies" empty="No movies found." />
      </section>
    </div>
  );
}
