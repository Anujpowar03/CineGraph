import { pathToFileURL } from 'node:url';
import bcrypt from 'bcryptjs';
import {
  closeDriver,
  describeConnectionError,
  readQuery,
  verifyConnection,
  writeQueryWithSummary,
} from '../config/neo4j.js';
import { env } from '../config/env.js';
import { MOVIES } from '../data/movies.js';
import { GENRES } from '../data/genres.js';
import { DEMO_PASSWORD, DEMO_USERS } from '../data/users.js';
import { slugify } from '../utils/slugify.js';
import { createConstraints } from './createConstraints.js';

/**
 * Repeatable seed script
 * ----------------------
 *   npm run seed          -> create or update the sample graph (idempotent)
 *   npm run seed:reset    -> DELETE ALL DATA in the database first, then seed
 *
 * Every statement uses MERGE on a stable identifier (movieId, genreId,
 * actorId, directorId, userId), so running the script twice never creates
 * duplicate nodes or relationships. Rows are sent in batches with UNWIND.
 */

const BATCH_SIZE = 100;
const CATALOGUE_START = Date.UTC(2026, 0, 1); // used for the deterministic "addedAt" dates
const ACTIVITY_START = Date.UTC(2026, 1, 1); // demo activity starts 1 Feb 2026
const DAY = 24 * 60 * 60 * 1000;

function chunk(rows, size = BATCH_SIZE) {
  const batches = [];
  for (let i = 0; i < rows.length; i += size) batches.push(rows.slice(i, i + size));
  return batches;
}

const iso = (ms) => new Date(ms).toISOString();

// --- Cypher -----------------------------------------------------------------

const MERGE_GENRES = `
  UNWIND $rows AS row
  MERGE (g:Genre {genreId: row.genreId})
  SET g.name = row.name
`;

const MERGE_MOVIES = `
  UNWIND $rows AS row
  MERGE (m:Movie {movieId: row.movieId})
  SET m.title = row.title,
      m.releaseYear = row.releaseYear,
      m.overview = row.overview,
      m.rating = toFloat(row.rating),
      m.runtime = row.runtime,
      m.addedAt = datetime(row.addedAt)
  // posterPath is deliberately not touched: only the optional TMDB sync sets it
`;

const MERGE_MOVIE_GENRES = `
  UNWIND $rows AS row
  MATCH (m:Movie {movieId: row.movieId})
  MATCH (g:Genre {genreId: row.genreId})
  MERGE (m)-[:IN_GENRE]->(g)
`;

const MERGE_ACTORS = `
  UNWIND $rows AS row
  MERGE (a:Actor {actorId: row.actorId})
  SET a.name = row.name
  WITH a, row
  MATCH (m:Movie {movieId: row.movieId})
  MERGE (a)-[r:ACTED_IN]->(m)
  SET r.billingOrder = row.billingOrder
`;

const MERGE_DIRECTORS = `
  UNWIND $rows AS row
  MERGE (d:Director {directorId: row.directorId})
  SET d.name = row.name
  WITH d, row
  MATCH (m:Movie {movieId: row.movieId})
  MERGE (d)-[:DIRECTED]->(m)
`;

// ON CREATE: the password hash is only set the first time, so re-seeding does
// not reset a password that was changed later.
const MERGE_USERS = `
  UNWIND $rows AS row
  MERGE (u:User {userId: row.userId})
  ON CREATE SET u.passwordHash = row.passwordHash, u.createdAt = datetime(row.createdAt)
  SET u.name = row.name, u.email = row.email
`;

const MERGE_PREFERENCES = `
  UNWIND $rows AS row
  MATCH (u:User {userId: row.userId})
  MATCH (g:Genre {genreId: row.genreId})
  MERGE (u)-[p:PREFERS]->(g)
  ON CREATE SET p.createdAt = datetime(row.at)
`;

const MERGE_LIKES = `
  UNWIND $rows AS row
  MATCH (u:User {userId: row.userId})
  MATCH (m:Movie {movieId: row.movieId})
  MERGE (u)-[l:LIKED]->(m)
  SET l.likedAt = datetime(row.at)
`;

const MERGE_RATINGS = `
  UNWIND $rows AS row
  MATCH (u:User {userId: row.userId})
  MATCH (m:Movie {movieId: row.movieId})
  MERGE (u)-[r:RATED]->(m)
  SET r.rating = row.rating, r.ratedAt = datetime(row.at)
`;

const MERGE_WATCHES = `
  UNWIND $rows AS row
  MATCH (u:User {userId: row.userId})
  MATCH (m:Movie {movieId: row.movieId})
  MERGE (u)-[w:WATCHED]->(m)
  SET w.watchedAt = datetime(row.at), w.watchCount = coalesce(w.watchCount, 1)
`;

const DELETE_BATCH = `
  MATCH (n) WITH n LIMIT 1000
  DETACH DELETE n
  RETURN count(*) AS deleted
`;

const GRAPH_TOTALS = `
  RETURN COUNT { (:Movie) } AS movies, COUNT { (:Genre) } AS genres,
         COUNT { (:Actor) } AS actors, COUNT { (:Director) } AS directors,
         COUNT { (:User) } AS users, COUNT { ()-[]->() } AS relationships
`;

// --- Row builders (pure functions, exported for unit tests) -------------------

export function buildCatalogueRows() {
  const movies = MOVIES.map((movie, index) => ({
    movieId: movie.id,
    title: movie.title,
    releaseYear: movie.year,
    overview: movie.overview,
    rating: movie.rating,
    runtime: movie.runtime,
    // Later list entries count as more recently added to the catalogue.
    addedAt: iso(CATALOGUE_START + index * DAY),
  }));
  const movieGenres = MOVIES.flatMap((movie) => movie.genres.map((genreId) => ({ movieId: movie.id, genreId })));
  const actors = MOVIES.flatMap((movie) =>
    movie.cast.map((name, i) => ({ actorId: slugify(name), name, movieId: movie.id, billingOrder: i + 1 })),
  );
  const directors = MOVIES.flatMap((movie) =>
    movie.directors.map((name) => ({ directorId: slugify(name), name, movieId: movie.id })),
  );
  return { movies, movieGenres, actors, directors };
}

export function buildInteractionRows() {
  const preferences = [];
  const likes = [];
  const ratings = [];
  const watches = [];
  DEMO_USERS.forEach((user, userIndex) => {
    // Each user gets their own activity window; list order = chronological order.
    const base = ACTIVITY_START + userIndex * 2 * DAY;
    const at = (step) => iso(base + step * 6 * 60 * 60 * 1000);
    user.preferences.forEach((genreId) => preferences.push({ userId: user.userId, genreId, at: at(0) }));
    user.watched.forEach((movieId, i) => watches.push({ userId: user.userId, movieId, at: at(i + 1) }));
    const watchStep = (movieId) => Math.max(1, user.watched.indexOf(movieId) + 1);
    user.likes.forEach((movieId) => likes.push({ userId: user.userId, movieId, at: at(watchStep(movieId) + 0.5) }));
    user.ratings.forEach(([movieId, rating]) =>
      ratings.push({ userId: user.userId, movieId, rating, at: at(watchStep(movieId) + 0.5) }),
    );
  });
  return { preferences, likes, ratings, watches };
}

// --- Runner -------------------------------------------------------------------

async function runBatched(label, cypher, rows, totals, log) {
  const sum = { nodesCreated: 0, relationshipsCreated: 0, propertiesSet: 0 };
  for (const rowsBatch of chunk(rows)) {
    const { counters } = await writeQueryWithSummary(cypher, { rows: rowsBatch });
    sum.nodesCreated += counters.nodesCreated;
    sum.relationshipsCreated += counters.relationshipsCreated;
    sum.propertiesSet += counters.propertiesSet;
  }
  totals.nodesCreated += sum.nodesCreated;
  totals.relationshipsCreated += sum.relationshipsCreated;
  log(
    `  ✓ ${label.padEnd(22)} ${String(rows.length).padStart(4)} rows processed · ` +
      `${sum.nodesCreated} nodes created · ${sum.relationshipsCreated} relationships created`,
  );
}

export async function resetDatabase({ log = console.log } = {}) {
  let deleted = 0;
  for (;;) {
    const { records } = await writeQueryWithSummary(DELETE_BATCH);
    const count = records[0]?.deleted ?? 0;
    deleted += count;
    if (count === 0) break;
  }
  log(`  ✓ Reset: deleted ${deleted} nodes (and their relationships)`);
}

export async function seedDatabase({ reset = false, log = console.log } = {}) {
  const totals = { nodesCreated: 0, relationshipsCreated: 0 };
  if (reset) await resetDatabase({ log });

  await createConstraints({ log });

  const catalogue = buildCatalogueRows();
  const interactions = buildInteractionRows();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = DEMO_USERS.map((user, i) => ({
    userId: user.userId,
    name: user.name,
    email: user.email,
    passwordHash,
    createdAt: iso(ACTIVITY_START - DAY + i * 60 * 1000),
  }));

  await runBatched('Genres', MERGE_GENRES, GENRES, totals, log);
  await runBatched('Movies', MERGE_MOVIES, catalogue.movies, totals, log);
  await runBatched('Movie → Genre', MERGE_MOVIE_GENRES, catalogue.movieGenres, totals, log);
  await runBatched('Actors + ACTED_IN', MERGE_ACTORS, catalogue.actors, totals, log);
  await runBatched('Directors + DIRECTED', MERGE_DIRECTORS, catalogue.directors, totals, log);
  await runBatched('Users', MERGE_USERS, users, totals, log);
  await runBatched('User → PREFERS', MERGE_PREFERENCES, interactions.preferences, totals, log);
  await runBatched('User → WATCHED', MERGE_WATCHES, interactions.watches, totals, log);
  await runBatched('User → LIKED', MERGE_LIKES, interactions.likes, totals, log);
  await runBatched('User → RATED', MERGE_RATINGS, interactions.ratings, totals, log);

  const [graph] = await readQuery(GRAPH_TOTALS);
  return { ...totals, graph };
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  const reset = process.argv.includes('--reset');
  const started = Date.now();
  try {
    const server = await verifyConnection();
    console.log(`Connected to ${server.agent} at ${server.address} (database "${env.neo4j.database}")`);
    console.log(reset ? 'Resetting and seeding the CineGraph sample graph...' : 'Seeding the CineGraph sample graph...');
    const summary = await seedDatabase({ reset });
    const { graph } = summary;
    console.log('\nSeed complete in', `${((Date.now() - started) / 1000).toFixed(1)}s`);
    console.log(`  This run created ${summary.nodesCreated} nodes and ${summary.relationshipsCreated} relationships`);
    console.log('  (0 created on a re-run means everything already existed - no duplicates).');
    console.log(
      `  Graph now holds: ${graph.movies} movies, ${graph.genres} genres, ${graph.actors} actors, ` +
        `${graph.directors} directors, ${graph.users} users, ${graph.relationships} relationships`,
    );
    console.log(`\nDemo login: aarav@cinegraph.demo / ${DEMO_PASSWORD} (all demo users share this password)`);
  } catch (error) {
    console.error(`\n✗ Seeding failed: ${describeConnectionError(error)}`);
    process.exitCode = 1;
  } finally {
    await closeDriver();
  }
}
