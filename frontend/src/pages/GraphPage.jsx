import { Expand, Loader2, Minus, Plus, RotateCcw, Shuffle, UserRound } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import GraphExplorer from '../components/graph/GraphExplorer.jsx';
import GraphLegend from '../components/graph/GraphLegend.jsx';
import NodeDetailsPanel from '../components/graph/NodeDetailsPanel.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { graphApi, moviesApi } from '../services/api.js';

const DEFAULT_MOVIE = 'inception-2010';
const EXPAND_PAGE = 12;

const merge = (current, incoming) => {
  const nodes = new Map(current.nodes.map((n) => [n.data.id, n]));
  incoming.nodes.forEach((n) => nodes.set(n.data.id, n));
  const edges = new Map(current.edges.map((e) => [e.data.id, e]));
  incoming.edges.forEach((e) => edges.set(e.data.id, e));
  return { nodes: [...nodes.values()], edges: [...edges.values()] };
};

/**
 * Interactive graph explorer. All nodes and edges come from the API
 * (GET /api/graph/movie/:id and /api/graph/neighborhood/:type/:id).
 */
export default function GraphPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const graphRef = useRef(null);
  const [elements, setElements] = useState({ nodes: [], edges: [] });
  const [centerId, setCenterId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanding, setExpanding] = useState(false);
  const [pages, setPages] = useState({}); // nodeId -> { loaded, total, hasMore }
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const debouncedSearch = useDebounce(search.trim(), 250);

  const movieId = params.get('movie');
  const showUser = params.get('user') === 'me';

  const loadRoot = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelected(null);
    setPages({});
    try {
      let res;
      if (showUser && user) {
        res = await graphApi.neighbourhood('user', 'me', { limit: 30 });
        setPages({ [res.data.center]: { loaded: res.data.page.returned, total: res.data.page.total, hasMore: res.data.page.hasMore } });
      } else {
        res = await graphApi.movie(movieId || DEFAULT_MOVIE, { relatedLimit: 8, userLimit: 4 });
      }
      setElements({ nodes: res.data.nodes, edges: res.data.edges });
      setCenterId(res.data.center);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [movieId, showUser, user]);

  useEffect(() => {
    loadRoot();
  }, [loadRoot]);

  useEffect(() => {
    if (!debouncedSearch) {
      setSuggestions([]);
      return;
    }
    moviesApi.search(debouncedSearch, 6).then((r) => setSuggestions(r.data)).catch(() => setSuggestions([]));
  }, [debouncedSearch]);

  const canExpandUser = (node) => Boolean(user && node.entityId === user.userId);

  const expand = useCallback(
    async (node) => {
      if (node.type === 'user' && !(user && node.entityId === user.userId)) {
        toast.info("Other users' interaction history is private.");
        return;
      }
      const page = pages[node.id];
      if (page && !page.hasMore) {
        toast.info('All connections for this node are already shown.');
        return;
      }
      setExpanding(true);
      try {
        const res = await graphApi.neighbourhood(node.type, node.entityId, { offset: page?.loaded ?? 0, limit: EXPAND_PAGE });
        const { returned, total, hasMore } = res.data.page;
        setPages((p) => ({ ...p, [node.id]: { loaded: (page?.loaded ?? 0) + returned, total, hasMore } }));
        setCenterId(node.id);
        setElements((current) => merge(current, res.data));
        if (returned === 0) toast.info('No further connections found.');
      } catch (err) {
        toast.error(err.message);
      } finally {
        setExpanding(false);
      }
    },
    [pages, toast, user],
  );

  const recenter = (node) => setParams({ movie: node.entityId });

  const chooseMovie = (id) => {
    setSearch('');
    setSuggestions([]);
    setParams({ movie: id });
  };

  return (
    <div className="container-page py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Interactive graph explorer</p>
          <h1 className="mt-1 text-3xl font-bold">See how movies connect</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Live data from Neo4j. Click a node to highlight its neighbours, double-click (or use “Expand”) to fetch more connections.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <label htmlFor="graph-search" className="sr-only">Load a movie's graph</label>
          <input
            id="graph-search"
            type="search"
            className="input"
            placeholder="Load another movie… e.g. Heat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-card">
              {suggestions.map((m) => (
                <li key={m.movieId}>
                  <button type="button" onClick={() => chooseMovie(m.movieId)} className="flex w-full justify-between px-4 py-2.5 text-left text-sm hover:bg-white/[0.06]">
                    <span className="text-white">{m.title}</span>
                    <span className="text-xs text-slate-500">{m.releaseYear}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="card relative h-[65vh] min-h-[420px] overflow-hidden p-0" aria-label="Graph canvas">
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
            <ToolButton label="Fit graph to screen" onClick={() => graphRef.current?.fit()} icon={Expand} />
            <ToolButton label="Zoom in" onClick={() => graphRef.current?.zoomBy(1.25)} icon={Plus} />
            <ToolButton label="Zoom out" onClick={() => graphRef.current?.zoomBy(0.8)} icon={Minus} />
            <ToolButton label="Re-run layout" onClick={() => graphRef.current?.relayout()} icon={Shuffle} />
            <ToolButton label="Reset view (reload original graph)" onClick={loadRoot} icon={RotateCcw} />
            {user && !showUser && (
              <button type="button" className="btn-secondary h-9 px-3 py-0 text-xs" onClick={() => setParams({ user: 'me' })}>
                <UserRound className="h-4 w-4" aria-hidden="true" /> My graph
              </button>
            )}
          </div>
          <div className="absolute bottom-3 left-3 right-3 z-10 rounded-xl border border-white/[0.06] bg-ink-900/80 px-3 py-2 backdrop-blur">
            <GraphLegend />
          </div>
          {(loading || expanding) && (
            <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-lg bg-ink-900/80 px-3 py-1.5 text-xs text-slate-300">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> {loading ? 'Loading graph…' : 'Expanding…'}
            </div>
          )}
          {error ? (
            <div className="grid h-full place-items-center p-6">
              <ErrorMessage error={error} onRetry={loadRoot} />
            </div>
          ) : (
            <GraphExplorer ref={graphRef} elements={elements} centerId={centerId} onSelect={setSelected} onExpand={expand} />
          )}
        </section>

        <aside className="card h-fit p-5" aria-label="Selected node details">
          <NodeDetailsPanel
            node={selected}
            onExpand={expand}
            onRecenter={recenter}
            expanding={expanding}
            pageInfo={selected ? pages[selected.id] : null}
            canExpandUser={canExpandUser}
          />
          <p className="mt-6 border-t border-white/[0.06] pt-4 text-xs text-slate-500">
            Showing {elements.nodes.length} nodes and {elements.edges.length} relationships. The first view is limited to keep the graph readable.
          </p>
        </aside>
      </div>
    </div>
  );
}

function ToolButton({ label, onClick, icon: Icon }) {
  return (
    <button type="button" onClick={onClick} className="btn-secondary h-9 w-9 bg-ink-900/80 p-0 backdrop-blur" aria-label={label} title={label}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
