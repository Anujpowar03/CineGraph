import { Link } from 'react-router-dom';

/** CineGraph wordmark: three connected nodes forming a "play" triangle. */
export function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="cg-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="#111727" stroke="rgba(255,255,255,0.08)" />
      <path d="M10 21 L16 10 L22 19 Z" fill="none" stroke="url(#cg-logo)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="10" cy="21" r="3.2" fill="#8b5cf6" />
      <circle cx="16" cy="10" r="3.2" fill="#a78bfa" />
      <circle cx="22" cy="19" r="3.2" fill="#2dd4bf" />
    </svg>
  );
}

export default function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5 rounded-lg" aria-label="CineGraph home">
      <LogoMark className="h-8 w-8 transition group-hover:scale-105" />
      <span className="font-display text-lg font-semibold tracking-tight text-white">
        Cine<span className="text-accent-soft">Graph</span>
      </span>
    </Link>
  );
}
