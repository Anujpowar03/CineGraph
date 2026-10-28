import { RotateCcw, SlidersHorizontal } from 'lucide-react';

const SORTS = [
  { value: 'rating', label: 'Rating' },
  { value: 'popularity', label: 'Most engaged' },
  { value: 'year', label: 'Release year' },
  { value: 'title', label: 'Title' },
  { value: 'added', label: 'Recently added' },
];

const RATINGS = ['', '7', '7.5', '8', '8.5', '9'];

/**
 * Controlled filter form. Every change updates the URL query string, which
 * the Explore page turns into an API request - filtering happens in Neo4j.
 */
export default function FilterPanel({ filters, genres, years, onChange, onReset }) {
  const set = (key) => (e) => onChange({ [key]: e.target.value });
  const toggleGenre = (genreId) => {
    const next = filters.genre.includes(genreId) ? filters.genre.filter((g) => g !== genreId) : [...filters.genre, genreId];
    onChange({ genre: next });
  };
  const yearOptions = [];
  if (years?.minYear) for (let y = years.maxYear; y >= years.minYear; y -= 1) yearOptions.push(y);

  return (
    <form className="card space-y-5 p-5" onSubmit={(e) => e.preventDefault()} aria-label="Movie filters">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-sans text-sm font-semibold text-white">
          <SlidersHorizontal className="h-4 w-4 text-accent-soft" aria-hidden="true" /> Filters
        </h2>
        <button type="button" onClick={onReset} className="btn-ghost px-2 py-1 text-xs">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset
        </button>
      </div>

      <div>
        <label htmlFor="filter-q" className="label">Title</label>
        <input id="filter-q" type="search" className="input" placeholder="e.g. Dune" value={filters.q} onChange={set('q')} maxLength={100} />
      </div>

      <fieldset>
        <legend className="label">Genres</legend>
        <div className="flex flex-wrap gap-1.5">
          {genres.map((g) => {
            const active = filters.genre.includes(g.genreId);
            return (
              <button
                key={g.genreId}
                type="button"
                aria-pressed={active}
                onClick={() => toggleGenre(g.genreId)}
                className={`chip transition ${active ? 'border-accent/60 bg-accent/20 text-violet-100' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25'}`}
              >
                {g.name}
                <span className="text-[10px] text-slate-500">{g.movieCount}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-500">Shows movies in any selected genre.</p>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="filter-from" className="label">From</label>
          <select id="filter-from" className="input" value={filters.yearFrom} onChange={set('yearFrom')}>
            <option value="">Any</option>
            {[...yearOptions].reverse().map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filter-to" className="label">To</label>
          <select id="filter-to" className="input" value={filters.yearTo} onChange={set('yearTo')}>
            <option value="">Any</option>
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="filter-rating" className="label">Minimum rating</label>
        <select id="filter-rating" className="input" value={filters.minRating} onChange={set('minRating')}>
          {RATINGS.map((r) => <option key={r} value={r}>{r ? `${r}+` : 'Any rating'}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div>
          <label htmlFor="filter-sort" className="label">Sort by</label>
          <select id="filter-sort" className="input" value={filters.sort} onChange={set('sort')}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filter-order" className="label">Order</label>
          <select id="filter-order" className="input" value={filters.order} onChange={set('order')}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>
    </form>
  );
}
