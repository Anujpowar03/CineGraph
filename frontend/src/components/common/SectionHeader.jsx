import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SectionHeader({ eyebrow, title, description, to, linkLabel = 'See all' }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {to && (
        <Link to={to} className="btn-ghost shrink-0 px-2 text-accent-soft hover:text-white">
          {linkLabel} <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
