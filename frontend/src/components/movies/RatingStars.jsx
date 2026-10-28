import { Star } from 'lucide-react';
import { useState } from 'react';

/**
 * Read-only display when onRate is not provided, otherwise an accessible
 * 1-5 radio group (arrow keys work natively).
 */
export default function RatingStars({ value = 0, onRate, disabled = false, size = 'h-5 w-5', label = 'Your rating' }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value || 0;

  if (!onRate) {
    return (
      <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className={`${size} ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} aria-hidden="true" />
        ))}
      </span>
    );
  }

  return (
    <fieldset className="inline-flex items-center gap-0.5" onMouseLeave={() => setHover(0)} disabled={disabled}>
      <legend className="sr-only">{label}</legend>
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className="cursor-pointer rounded p-0.5 focus-within:ring-2 focus-within:ring-accent-soft" onMouseEnter={() => setHover(n)}>
          <input
            type="radio"
            name="rating"
            value={n}
            checked={value === n}
            onChange={() => onRate(n)}
            className="sr-only"
          />
          <Star
            className={`${size} transition ${n <= shown ? 'fill-amber-400 text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
            aria-hidden="true"
          />
          <span className="sr-only">{n} {n === 1 ? 'star' : 'stars'}</span>
        </label>
      ))}
    </fieldset>
  );
}
