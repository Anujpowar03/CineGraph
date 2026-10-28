import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function FavoriteButton({ movie, variant = 'icon' }) {
  const { user, favoriteIds, toggleFavorite } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const active = favoriteIds.has(movie.movieId);

  const handleClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      toast.info('Sign in to save favourites and get recommendations.');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    setBusy(true);
    try {
      const nowFavorite = await toggleFavorite(movie.movieId);
      toast.success(nowFavorite ? `Added “${movie.title}” to favourites` : `Removed “${movie.title}” from favourites`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const label = active ? `Remove ${movie.title} from favourites` : `Add ${movie.title} to favourites`;

  if (variant === 'button') {
    return (
      <button type="button" onClick={handleClick} disabled={busy} aria-pressed={active} className={active ? 'btn-primary' : 'btn-secondary'}>
        <Heart className={`h-4 w-4 ${active ? 'fill-current' : ''}`} aria-hidden="true" />
        {active ? 'In favourites' : 'Add to favourites'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition ${
        active
          ? 'border-rose-400/40 bg-rose-500/20 text-rose-300'
          : 'border-white/15 bg-black/40 text-white/80 hover:border-white/30 hover:text-white'
      }`}
    >
      <Heart className={`h-4 w-4 ${active ? 'fill-current' : ''}`} aria-hidden="true" />
    </button>
  );
}
