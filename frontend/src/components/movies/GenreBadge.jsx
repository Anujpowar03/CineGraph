import { Link } from 'react-router-dom';

const slug = (name) => name.toLowerCase().replace(/\s+/g, '-');

export default function GenreBadge({ name, genreId, link = false, active = false, size = 'sm' }) {
  const classes = `chip ${size === 'xs' ? 'px-2 py-0.5 text-[11px]' : ''} ${
    active ? 'border-accent/60 bg-accent/15 text-violet-100' : 'border-white/10 bg-white/[0.04] text-slate-300'
  }`;
  if (link) {
    return (
      <Link to={`/explore?genre=${genreId || slug(name)}`} className={`${classes} transition hover:border-accent/50 hover:text-white`}>
        {name}
      </Link>
    );
  }
  return <span className={classes}>{name}</span>;
}
