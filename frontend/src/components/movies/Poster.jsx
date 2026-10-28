import { useState } from 'react';
import { posterTheme, tmdbImage } from '../../utils/poster.js';

/**
 * Shows the TMDB poster when one has been synced; otherwise draws
 * deterministic CineGraph artwork (gradient + a tiny constellation graph).
 */
export default function Poster({ movie, size = 'w342', className = '', showTitle = true }) {
  const [failed, setFailed] = useState(false);
  const src = tmdbImage(movie?.posterPath, size);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={`Poster for ${movie.title}`}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const theme = posterTheme(movie?.movieId || movie?.title || 'cinegraph');
  const nodes = theme.nodes;
  return (
    <div
      className={`relative flex h-full w-full flex-col justify-end overflow-hidden ${className}`}
      style={{ background: `linear-gradient(160deg, ${theme.from} 0%, ${theme.via} 55%, #05070d 100%)` }}
      role="img"
      aria-label={`Poster artwork for ${movie?.title ?? 'movie'}`}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-70" preserveAspectRatio="none" aria-hidden="true">
        {nodes.slice(1).map((n, i) => (
          <line key={i} x1={nodes[i].x} y1={nodes[i].y} x2={n.x} y2={n.y} stroke={theme.accent} strokeOpacity="0.35" strokeWidth="0.35" />
        ))}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={i % 2 ? theme.accent : theme.glow} fillOpacity="0.55" />
        ))}
      </svg>
      <div
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
        style={{ background: theme.glow, opacity: 0.18 }}
        aria-hidden="true"
      />
      {showTitle && (
        <div className="relative p-3 sm:p-4">
          <p className="font-display text-base font-semibold leading-tight text-white drop-shadow sm:text-lg">
            {movie?.title}
          </p>
          {movie?.releaseYear && <p className="mt-1 text-xs font-medium tracking-widest text-white/60">{movie.releaseYear}</p>}
        </div>
      )}
    </div>
  );
}
