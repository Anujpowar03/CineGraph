import { ChevronDown, Network, Star } from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from '../movies/FavoriteButton.jsx';
import GenreBadge from '../movies/GenreBadge.jsx';
import Poster from '../movies/Poster.jsx';
import RecommendationExplanation from './RecommendationExplanation.jsx';

export default function RecommendationCard({ item, rank, weights }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <article className="card flex animate-fade-in flex-row gap-4 p-4 sm:p-5">
      <Link
        to={`/movies/${item.movieId}`}
        className="relative aspect-[2/3] w-20 shrink-0 self-start sm:w-32 overflow-hidden rounded-xl border border-white/[0.07] sm:w-32"
        aria-label={`${item.title} details`}
      >
        <Poster movie={item} showTitle={false} />
        <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-bold text-white backdrop-blur">
          #{rank}
        </span>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-sans text-base font-semibold text-white sm:text-lg">
              <Link to={`/movies/${item.movieId}`} className="hover:text-accent-soft">{item.title}</Link>
            </h3>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
              <span>{item.releaseYear}</span>
              <span className="flex items-center gap-0.5 text-amber-300">
                <Star className="h-3 w-3 fill-current" aria-hidden="true" /> {item.rating?.toFixed(1)}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {item.matchPercent != null && (
              <div className="text-right" title="Hybrid relevance score (0-100)">
                <p className="font-display text-xl font-bold leading-none text-white">{item.matchPercent}%</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">match</p>
              </div>
            )}
            <FavoriteButton movie={item} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-200">{item.headline}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.genres?.map((g) => (
            <GenreBadge key={g} name={g} size="xs" active={item.sharedGenres?.includes(g)} />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-ghost px-3 py-1.5 text-xs"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            {open ? 'Hide explanation' : 'Why this movie?'}
          </button>
          <Link to={`/graph?movie=${item.movieId}`} className="btn-ghost px-3 py-1.5 text-xs text-accent-soft">
            <Network className="h-4 w-4" aria-hidden="true" /> Explore graph
          </Link>
        </div>

        {open && (
          <div id={panelId} className="mt-3">
            <RecommendationExplanation item={item} weights={weights} />
          </div>
        )}
      </div>
    </article>
  );
}
