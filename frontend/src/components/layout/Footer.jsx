import { Database, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LogoMark } from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-ink-950/60">
      <div className="container-page grid gap-8 py-10 text-sm text-slate-400 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-7" />
            <span className="font-display font-semibold text-white">CineGraph</span>
          </div>
          <p className="mt-3 max-w-sm">
            Discover Movies Through Connections. A college mini project showing how a graph database turns
            relationships between users, movies, genres and people into explainable recommendations.
          </p>
        </div>
        <div>
          <p className="mb-3 font-semibold text-slate-200">Explore</p>
          <ul className="space-y-2">
            <li><Link className="hover:text-white" to="/explore">Movie catalogue</Link></li>
            <li><Link className="hover:text-white" to="/recommendations">Recommendations</Link></li>
            <li><Link className="hover:text-white" to="/graph">Graph explorer</Link></li>
            <li><Link className="hover:text-white" to="/analytics">Insights &amp; about</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-slate-200">Built with</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2"><Database className="h-4 w-4" aria-hidden="true" /> Neo4j &amp; Cypher</li>
            <li className="flex items-center gap-2"><GitBranch className="h-4 w-4" aria-hidden="true" /> React, Express, Cytoscape.js</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/[0.04]">
        <p className="container-page py-4 text-xs leading-relaxed text-slate-500">
          Sample catalogue metadata (runtimes, ratings) is approximate and for educational use. When poster sync is
          enabled, this product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </footer>
  );
}
