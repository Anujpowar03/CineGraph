import { Info, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton.jsx';
import Poster from './Poster.jsx';

export default function MovieCard({ movie, showOverview = true, footer }) {
  return (
    <article className="group flex flex-col animate-fade-in">
      <Link
        to={`/movies/${movie.movieId}`}
        className="relative block aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-800 shadow-card transition duration-300 group-hover:-translate-y-1 group-hover:border-accent/40 group-hover:shadow-glow"
        aria-label={`${movie.title} (${movie.releaseYear}) - view details`}
      >
        <Poster movie={movie} className="transition duration-500 group-hover:scale-[1.03]" />
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
          <Star className="h-3 w-3 fill-current" aria-hidden="true" />
          {movie.rating?.toFixed(1)}
        </div>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-sans text-sm font-semibold text-white">
            <Link to={`/movies/${movie.movieId}`} className="hover:text-accent-soft">{movie.title}</Link>
          </h3>
          <p className="mt-0.5 truncate text-xs text-slate-400">
            {movie.releaseYear}
            {movie.genres?.length ? ` · ${movie.genres.slice(0, 3).join(', ')}` : ''}
          </p>
        </div>
        <FavoriteButton movie={movie} />
      </div>
      {showOverview && movie.overview && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">{movie.overview}</p>
      )}
      {footer !== undefined ? footer : (
        <Link to={`/movies/${movie.movieId}`} className="mt-2 inline-flex w-fit items-center gap-1 text-xs font-medium text-accent-soft hover:text-white">
          <Info className="h-3.5 w-3.5" aria-hidden="true" /> Details
        </Link>
      )}
    </article>
  );
}
