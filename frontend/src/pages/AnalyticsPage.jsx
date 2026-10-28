import { Clapperboard, Database, Drama, Film, GitBranch, Heart, Star, Tags, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { analyticsApi } from '../services/api.js';

const AXIS = { stroke: '#64748b', fontSize: 11, tickLine: false, axisLine: false };
const TOOLTIP = {
  contentStyle: { background: '#111727', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

function ChartCard({ title, description, children }) {
  return (
    <section className="card p-5">
      <h2 className="font-sans text-sm font-semibold text-white">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function AnalyticsPage() {
  const data = useAsync(async () => {
    const [overview, genres, top, ratings, people, decades] = await Promise.all([
      analyticsApi.overview(),
      analyticsApi.genres(),
      analyticsApi.topMovies(8),
      analyticsApi.ratingDistribution(),
      analyticsApi.people(8),
      analyticsApi.decades(),
    ]);
    return { overview: overview.data, genres: genres.data, top: top.data, ratings: ratings.data, people: people.data, decades: decades.data };
  }, []);

  return (
    <div className="container-page space-y-10 py-8">
      <header>
        <p className="eyebrow">Insights</p>
        <h1 className="mt-1 text-3xl font-bold">The graph in numbers</h1>
        <p className="mt-1 text-sm text-slate-400">Every figure on this page is calculated live by Cypher queries against Neo4j.</p>
      </header>

      {data.loading ? (
        <LoadingSpinner label="Running analytics queries…" />
      ) : data.error ? (
        <ErrorMessage error={data.error} onRetry={data.reload} />
      ) : (
        <Dashboard {...data.data} />
      )}

      <About />
    </div>
  );
}

function Dashboard({ overview, genres, top, ratings, people, decades }) {
  const stats = [
    { label: 'Movies', value: overview.movies, icon: Film },
    { label: 'Users', value: overview.users, icon: Users },
    { label: 'Genres', value: overview.genres, icon: Tags },
    { label: 'Actors', value: overview.actors, icon: Drama },
    { label: 'Directors', value: overview.directors, icon: Clapperboard },
    { label: 'Ratings', value: overview.ratings, icon: Star },
    { label: 'Likes', value: overview.likes, icon: Heart },
    {
      label: 'Relationships',
      value: overview.ratings + overview.likes + overview.watches + overview.preferences + overview.actingCredits + overview.directingCredits + overview.genreLinks,
      icon: GitBranch,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Graph totals">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-4">
            <Icon className="h-4 w-4 text-accent-soft" aria-hidden="true" />
            <p className="mt-3 font-display text-2xl font-bold text-white tabular-nums">{value.toLocaleString()}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Most popular genres" description="Likes received by movies in each genre, alongside catalogue size">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={genres} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="genre" {...AXIS} interval={0} angle={-35} textAnchor="end" height={60} />
                <YAxis {...AXIS} allowDecimals={false} />
                <Tooltip {...TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="likes" name="Likes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="movieCount" name="Movies" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Rating distribution" description="All (:User)-[:RATED]->(:Movie) relationships by stars">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={ratings.map((r) => ({ ...r, label: `${r.stars}★` }))} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" {...AXIS} />
                <YAxis {...AXIS} allowDecimals={false} />
                <Tooltip {...TOOLTIP} />
                <Bar dataKey="count" name="Ratings" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Highest-rated movies" description="Approximate catalogue rating (0-10)">
          <RankedList items={top.catalogue.map((m) => ({ id: m.movieId, title: m.title, sub: m.releaseYear, value: m.rating.toFixed(1) }))} />
        </ChartCard>
        <ChartCard title="Top rated by CineGraph users" description="Average stars, minimum 2 ratings">
          {top.community.length ? (
            <RankedList items={top.community.map((m) => ({ id: m.movieId, title: m.title, sub: `${m.ratingCount} ratings`, value: `${m.average.toFixed(2)}★` }))} />
          ) : (
            <p className="text-sm text-slate-400">Not enough ratings yet.</p>
          )}
        </ChartCard>
        <ChartCard title="Most connected people" description="Actor/Director nodes with the most movie edges">
          <ul className="space-y-2 text-sm">
            {people.map((p) => (
              <li key={`${p.role}-${p.name}`} className="flex items-center justify-between gap-2">
                <span className="truncate text-slate-200">{p.name} <span className="text-xs text-slate-500">· {p.role}</span></span>
                <span className="tabular-nums text-slate-400">{p.movies}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>

      <ChartCard title="Catalogue by decade" description="Movies per release decade">
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={decades.map((d) => ({ ...d, label: `${d.decade}s` }))} margin={{ left: -20, right: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" {...AXIS} />
              <YAxis {...AXIS} allowDecimals={false} />
              <Tooltip {...TOOLTIP} />
              <Bar dataKey="movies" name="Movies" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

function RankedList({ items }) {
  return (
    <ol className="space-y-2 text-sm">
      {items.map((item, i) => (
        <li key={item.id} className="flex items-center gap-3">
          <span className="w-5 text-right text-xs tabular-nums text-slate-500">{i + 1}</span>
          <Link to={`/movies/${item.id}`} className="min-w-0 flex-1 truncate text-slate-200 hover:text-accent-soft">
            {item.title} <span className="text-xs text-slate-500">· {item.sub}</span>
          </Link>
          <span className="tabular-nums text-slate-300">{item.value}</span>
        </li>
      ))}
    </ol>
  );
}

function About() {
  return (
    <section className="grid gap-6 lg:grid-cols-2" aria-labelledby="about-title">
      <div className="card p-6 lg:col-span-2">
        <p className="eyebrow">About the project</p>
        <h2 id="about-title" className="mt-1 text-2xl font-semibold">Why a graph database?</h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          A graph database stores data as <strong className="text-white">nodes</strong> (things such as users, movies and actors) and{' '}
          <strong className="text-white">relationships</strong> (how they connect, such as LIKED or ACTED_IN). Relationships are stored
          directly, so following them — “movies by the same director as a movie this user liked” — is a cheap pointer walk instead of a
          chain of expensive table joins.
        </p>
      </div>
      <AboutCard title="Why Neo4j?" icon={Database}>
        Neo4j is a mature, widely used graph database with a free AuraDB tier and Desktop edition, ACID transactions, uniqueness
        constraints and Cypher — a readable, pattern-based query language where <code>(u:User)-[:LIKED]-&gt;(m:Movie)</code> looks like
        the diagram it describes. An official JavaScript driver connects it to Express.
      </AboutCard>
      <AboutCard title="How relationships power recommendations" icon={GitBranch}>
        Starting from movies you liked or rated 4★+, CineGraph walks to their genres, actors and directors and on to other movies, and
        through users who liked the same films. Each signal is normalised to 0–1 and combined:
        <code className="mt-2 block rounded-lg bg-ink-900 p-2 text-xs text-slate-200">
          score = 0.30·genre + 0.15·actor + 0.15·director + 0.25·similarUsers + 0.15·rating
        </code>
        Unavailable signals are left out and the remaining weights rescaled.
      </AboutCard>
      <AboutCard title="Limitations" icon={Star}>
        <ul className="list-disc space-y-1 pl-5">
          <li>Small curated sample: 80 movies and 8 demo users, so collaborative filtering has little evidence.</li>
          <li>Runtimes and ratings are approximate sample metadata, not an official data feed.</li>
          <li>Similarity is computed per request rather than pre-computed, which is fine at this scale but not for millions of users.</li>
          <li>Weights are hand-tuned and explainable, not learned from data; offline Precision@K on this tiny dataset is only illustrative.</li>
        </ul>
      </AboutCard>
      <AboutCard title="Technologies" icon={Film}>
        React 18, Vite, Tailwind CSS, React Router, Axios, Recharts and Cytoscape.js on the front end; Node.js, Express, the official
        Neo4j JavaScript driver, express-validator, bcrypt (bcryptjs) and JWT in an httpOnly cookie on the back end; Neo4j 5 with Cypher
        as the only database; Vitest and Supertest for testing.
      </AboutCard>
    </section>
  );
}

function AboutCard({ title, icon: Icon, children }) {
  return (
    <div className="card p-6">
      <h3 className="flex items-center gap-2 font-sans text-base font-semibold text-white">
        <Icon className="h-4 w-4 text-accent-soft" aria-hidden="true" /> {title}
      </h3>
      <div className="mt-3 text-sm leading-relaxed text-slate-300">{children}</div>
    </div>
  );
}
