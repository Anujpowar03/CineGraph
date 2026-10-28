import { ChevronLeft, ChevronRight, Network, Play, Star } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton.jsx';
import Poster from './Poster.jsx';

/**
 * Featured movies carousel.
 * Keyboard: ←/→ when focused. Touch: swipe. Auto-advances unless the user
 * interacts, hovers, or prefers reduced motion.
 */
export default function FeaturedCarousel({ movies }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(null);
  const count = movies.length;

  const go = useCallback((delta) => setIndex((i) => (i + delta + count) % count), [count]);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (paused || reduce || count < 2) return undefined;
    const timer = setInterval(() => go(1), 7000);
    return () => clearInterval(timer);
  }, [paused, go, count]);

  if (!count) return null;
  const movie = movies[index];

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-850"
      aria-roledescription="carousel"
      aria-label="Featured movies"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { setPaused(true); go(1); }
        if (e.key === 'ArrowLeft') { setPaused(true); go(-1); }
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        if (touchStart.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchStart.current = null;
      }}
    >
      <div className="absolute inset-0 opacity-40 blur-2xl" aria-hidden="true">
        <Poster movie={movie} showTitle={false} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-ink-900/40" aria-hidden="true" />

      <div
        key={movie.movieId}
        className="relative grid animate-fade-in items-center gap-6 p-6 sm:p-10 md:grid-cols-[1fr_auto] md:gap-12"
        role="group"
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${count}: ${movie.title}`}
      >
        <div className="max-w-xl">
          <p className="eyebrow">Featured · most engaged on CineGraph</p>
          <h1 className="mt-3 text-balance text-3xl font-bold leading-tight sm:text-5xl">{movie.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-300">
            <span className="flex items-center gap-1 text-amber-300">
              <Star className="h-4 w-4 fill-current" aria-hidden="true" /> {movie.rating?.toFixed(1)}
            </span>
            <span>{movie.releaseYear}</span>
            <span className="text-slate-500">•</span>
            <span>{movie.genres?.join(', ')}</span>
          </div>
          <p className="mt-4 line-clamp-3 text-slate-300">{movie.overview}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/movies/${movie.movieId}`} className="btn-primary">
              <Play className="h-4 w-4 fill-current" aria-hidden="true" /> View details
            </Link>
            <Link to={`/graph?movie=${movie.movieId}`} className="btn-secondary">
              <Network className="h-4 w-4" aria-hidden="true" /> Explore connections
            </Link>
            <FavoriteButton movie={movie} />
          </div>
        </div>
        <Link
          to={`/movies/${movie.movieId}`}
          className="mx-auto hidden aspect-[2/3] w-52 overflow-hidden rounded-2xl border border-white/10 shadow-glow md:block lg:w-60"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Poster movie={movie} size="w500" />
        </Link>
      </div>

      {count > 1 && (
        <div className="relative flex items-center justify-between gap-4 px-6 pb-6 sm:px-10">
          <div className="flex gap-1.5" role="tablist" aria-label="Choose featured movie">
            {movies.map((m, i) => (
              <button
                key={m.movieId}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show ${m.title}`}
                onClick={() => { setPaused(true); setIndex(i); }}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-accent-soft' : 'w-3 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary h-9 w-9 p-0" onClick={() => { setPaused(true); go(-1); }} aria-label="Previous featured movie">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" className="btn-secondary h-9 w-9 p-0" onClick={() => { setPaused(true); go(1); }} aria-label="Next featured movie">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
