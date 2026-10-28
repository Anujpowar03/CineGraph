import { Film, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { MovieGridSkeleton } from '../components/common/Skeleton.jsx';
import FilterPanel from '../components/movies/FilterPanel.jsx';
import MovieGrid from '../components/movies/MovieGrid.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { moviesApi } from '../services/api.js';

const PAGE_SIZE = 20;
const DEFAULTS = { q: '', genre: [], yearFrom: '', yearTo: '', minRating: '', sort: 'rating', order: 'desc' };

function readFilters(params) {
  return {
    q: params.get('q') || '',
    genre: (params.get('genre') || '').split(',').filter(Boolean),
    yearFrom: params.get('yearFrom') || '',
    yearTo: params.get('yearTo') || '',
    minRating: params.get('minRating') || '',
    sort: params.get('sort') || 'rating',
    order: params.get('order') || (params.get('sort') === 'title' ? 'asc' : 'desc'),
  };
}

/**
 * Movie Explorer. Filters live in the URL (shareable, back-button friendly)
 * and are sent to GET /api/movies, where Cypher does the filtering.
 */
export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);
  const [qInput, setQInput] = useState(filters.q);
  const debouncedQ = useDebounce(qInput, 350);
  const [pages, setPages] = useState({ items: [], page: 1, meta: null });
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(null);

  const meta = useAsync(() => moviesApi.meta().then((r) => r.data), []);

  useEffect(() => {
    setQInput(filters.q);
  }, [filters.q]);

  const update = (changes) => {
    const next = { ...filters, ...changes };
    const search = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      const value = Array.isArray(v) ? v.join(',') : v;
      if (value && value !== DEFAULTS[k]) search.set(k, value);
    });
    setParams(search, { replace: true });
  };

  useEffect(() => {
    if (debouncedQ !== filters.q) update({ q: debouncedQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const query = { ...filters, limit: PAGE_SIZE };
  const first = useAsync(() => moviesApi.list({ ...query, page: 1 }), [params.toString()]);

  useEffect(() => {
    if (first.data) setPages({ items: first.data.data, page: 1, meta: first.data.meta });
  }, [first.data]);

  const loadMore = async () => {
    setLoadingMore(true);
    setMoreError(null);
    try {
      const res = await moviesApi.list({ ...query, page: pages.page + 1 });
      setPages((p) => ({ items: [...p.items, ...res.data], page: p.page + 1, meta: res.meta }));
    } catch (error) {
      setMoreError(error);
    } finally {
      setLoadingMore(false);
    }
  };

  const filterValues = { ...filters, q: qInput };

  return (
    <div className="container-page py-8">
      <header className="mb-6">
        <p className="eyebrow">Movie explorer</p>
        <h1 className="mt-1 text-3xl font-bold">Browse the catalogue</h1>
        <p className="mt-1 text-sm text-slate-400" aria-live="polite">
          {pages.meta ? `${pages.meta.total} movies match your filters` : 'Loading catalogue…'}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <FilterPanel
            filters={filterValues}
            genres={meta.data?.genres || []}
            years={meta.data?.years}
            onChange={(changes) => ('q' in changes ? setQInput(changes.q) : update(changes))}
            onReset={() => {
              setQInput('');
              setParams(new URLSearchParams(), { replace: true });
            }}
          />
        </aside>

        <section aria-label="Results">
          {first.loading ? (
            <MovieGridSkeleton count={10} />
          ) : first.error ? (
            <ErrorMessage error={first.error} onRetry={first.reload} />
          ) : pages.items.length === 0 ? (
            <EmptyState icon={Film} title="No movies match these filters" description="Try removing a genre, widening the year range or lowering the minimum rating." />
          ) : (
            <>
              <MovieGrid movies={pages.items} />
              <div className="mt-10 flex flex-col items-center gap-2">
                {moreError && <p className="text-sm text-rose-300">{moreError.message}</p>}
                {pages.meta?.hasMore ? (
                  <button type="button" className="btn-secondary min-w-48" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    Load more
                  </button>
                ) : (
                  <p className="text-xs text-slate-500">You have reached the end of the results.</p>
                )}
                <p className="text-xs text-slate-500">Showing {pages.items.length} of {pages.meta?.total}</p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
