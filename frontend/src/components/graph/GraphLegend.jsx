import { NODE_STYLES } from './graphStyles.js';

const SHAPES = {
  'round-rectangle': 'rounded-[3px]',
  hexagon: '[clip-path:polygon(25%_0,75%_0,100%_50%,75%_100%,25%_100%,0_50%)]',
  ellipse: 'rounded-full',
  diamond: 'rotate-45 scale-[0.8]',
};

export default function GraphLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-300" aria-label="Graph legend">
      {Object.entries(NODE_STYLES).map(([type, s]) => (
        <li key={type} className="flex items-center gap-1.5">
          <span className={`inline-block h-3 w-3 ${SHAPES[s.shape]}`} style={{ background: s.color }} aria-hidden="true" />
          {s.label}
        </li>
      ))}
      <li className="flex items-center gap-1.5 text-slate-400">
        <span className="inline-block h-px w-5 bg-rose-400/70" aria-hidden="true" /> LIKED
      </li>
      <li className="flex items-center gap-1.5 text-slate-400">
        <span className="inline-block w-5 border-t border-dashed border-slate-400" aria-hidden="true" /> RATED
      </li>
    </ul>
  );
}
