import { Loader2, Search } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce.js';
import { moviesApi } from '../../services/api.js';

/**
 * Search box with live suggestions (combobox pattern):
 * ↑/↓ moves through results, Enter opens one (or the full results page), Esc closes.
 */
export default function SearchBar({ autoFocus = false }) {
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query.trim(), 250);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!debounced) {
      setResults([]);
      return undefined;
    }
    let current = true;
    setLoading(true);
    moviesApi
      .search(debounced, 6)
      .then((res) => current && setResults(res.data))
      .catch(() => current && setResults([]))
      .finally(() => current && setLoading(false));
    return () => {
      current = false;
    };
  }, [debounced]);

  useEffect(() => {
    const close = (e) => !boxRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const go = (path) => {
    setOpen(false);
    setQuery('');
    navigate(path);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && results[active]) go(`/movies/${results[active].movieId}`);
      else if (query.trim()) go(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const showList = open && query.trim().length > 0;

  return (
    <div ref={boxRef} className="relative w-full">
      <label htmlFor={`${listId}-input`} className="sr-only">Search movies</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
      <input
        id={`${listId}-input`}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder="Search movies…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="input rounded-full bg-ink-800/80 py-2 pl-9 pr-9"
      />
      {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-500" aria-hidden="true" />}
      {showList && (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-card">
          {results.length === 0 && !loading && <li className="px-4 py-3 text-sm text-slate-400">No movies match “{query.trim()}”.</li>}
          {results.map((movie, i) => (
            <li
              key={movie.movieId}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(`/movies/${movie.movieId}`)}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm ${i === active ? 'bg-white/[0.07]' : ''}`}
            >
              <span className="truncate text-white">{movie.title}</span>
              <span className="shrink-0 text-xs text-slate-500">{movie.releaseYear}</span>
            </li>
          ))}
          {query.trim() && (
            <li
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(`/explore?q=${encodeURIComponent(query.trim())}`)}
              className="cursor-pointer border-t border-white/[0.06] px-4 py-2.5 text-xs font-medium text-accent-soft hover:bg-white/[0.05]"
            >
              See all results for “{query.trim()}”
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
