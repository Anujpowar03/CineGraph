import { ExternalLink, Loader2, Lock, Maximize2, Network, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NODE_STYLES } from './graphStyles.js';

/** Details for the selected node plus actions to grow the graph from it. */
export default function NodeDetailsPanel({ node, onExpand, onRecenter, expanding, pageInfo, canExpandUser }) {
  if (!node) {
    return (
      <div className="text-sm text-slate-400">
        <p className="font-semibold text-slate-200">Select a node</p>
        <p className="mt-1">
          Click any circle or shape to see its details and highlight its direct connections. Double-click a node to load more of its
          neighbours from Neo4j.
        </p>
      </div>
    );
  }

  const style = NODE_STYLES[node.type];
  const grouped = node.neighbours.reduce((acc, n) => {
    (acc[n.type] ||= []).push(n.label);
    return acc;
  }, {});
  const isPrivateUser = node.type === 'user' && !canExpandUser(node);
  const more = pageInfo?.hasMore;

  return (
    <div className="space-y-4">
      <div>
        <span className="chip border-white/10" style={{ color: style.color }}>{style.label}</span>
        <h2 className="mt-2 font-sans text-lg font-semibold text-white">{node.isViewer ? `You (${node.name})` : node.label}</h2>
        {node.type === 'movie' && (
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
            {node.releaseYear}
            {node.rating != null && (
              <span className="flex items-center gap-1 text-amber-300">
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> {node.rating.toFixed(1)}
              </span>
            )}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-500">{node.degree} connection{node.degree === 1 ? '' : 's'} currently shown</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {node.type === 'movie' && (
          <>
            <Link to={`/movies/${node.entityId}`} className="btn-secondary px-3 py-1.5 text-xs">
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Movie page
            </Link>
            <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => onRecenter(node)}>
              <Network className="h-3.5 w-3.5" aria-hidden="true" /> Make centre
            </button>
          </>
        )}
        {isPrivateUser ? (
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Other users' activity is private.
          </p>
        ) : (
          <button type="button" className="btn-primary px-3 py-1.5 text-xs" onClick={() => onExpand(node)} disabled={expanding || pageInfo?.hasMore === false}>
            {expanding ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />}
            {pageInfo ? (more ? `Load more (${pageInfo.total - pageInfo.loaded} left)` : 'All connections loaded') : 'Expand connections'}
          </button>
        )}
      </div>

      {Object.keys(grouped).length > 0 && (
        <div className="space-y-3">
          {Object.entries(grouped).map(([type, labels]) => (
            <div key={type}>
              <p className="label" style={{ color: NODE_STYLES[type]?.color }}>
                {NODE_STYLES[type]?.label}s ({labels.length})
              </p>
              <p className="text-sm leading-relaxed text-slate-300">{labels.slice(0, 12).join(', ')}{labels.length > 12 ? '…' : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
