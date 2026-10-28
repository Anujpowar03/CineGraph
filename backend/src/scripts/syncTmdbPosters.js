import { pathToFileURL } from 'node:url';
import { env } from '../config/env.js';
import { closeDriver, describeConnectionError, readQuery, verifyConnection, writeQuery } from '../config/neo4j.js';

/**
 * OPTIONAL: fetch poster/backdrop paths from The Movie Database (TMDB).
 *
 *   1. Create a free TMDB account and copy the "API Read Access Token".
 *   2. Put it in backend/.env as TMDB_READ_ACCESS_TOKEN=...
 *   3. npm run tmdb:sync           (only movies without a poster)
 *      npm run tmdb:sync -- --force (refresh every movie)
 *
 * Only TMDB's image *paths* (e.g. "/abc123.jpg") are stored in Neo4j; images
 * are loaded by the browser directly from image.tmdb.org. The app works fully
 * without this step (it draws its own poster artwork).
 *
 * Attribution required by TMDB's terms is shown in the app footer:
 * "This product uses the TMDB API but is not endorsed or certified by TMDB."
 */

const SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';
const DELAY_MS = 120; // stay well below TMDB's rate limits

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function searchTmdb(title, year) {
  const url = new URL(SEARCH_URL);
  url.searchParams.set('query', title);
  url.searchParams.set('year', String(year));
  url.searchParams.set('include_adult', 'false');
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${env.tmdb.readAccessToken}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status === 401) throw new Error('TMDB rejected the token (401). Check TMDB_READ_ACCESS_TOKEN.');
  if (!response.ok) throw new Error(`TMDB responded with HTTP ${response.status}`);
  const body = await response.json();
  return body.results?.[0] ?? null;
}

async function main() {
  if (!env.tmdb.readAccessToken) {
    console.log('TMDB_READ_ACCESS_TOKEN is not set - nothing to do. CineGraph will use generated poster artwork.');
    return;
  }
  await verifyConnection();
  const force = process.argv.includes('--force');
  const movies = await readQuery(
    `MATCH (m:Movie) WHERE $force OR m.posterPath IS NULL
     RETURN m.movieId AS movieId, m.title AS title, m.releaseYear AS year ORDER BY m.title`,
    { force },
  );
  console.log(`Looking up ${movies.length} movies on TMDB...`);
  let updated = 0;
  let missing = 0;
  for (const movie of movies) {
    try {
      const match = await searchTmdb(movie.title, movie.year);
      if (match?.poster_path) {
        await writeQuery(
          `MATCH (m:Movie {movieId: $movieId})
           SET m.posterPath = $posterPath, m.backdropPath = $backdropPath, m.tmdbId = $tmdbId`,
          { movieId: movie.movieId, posterPath: match.poster_path, backdropPath: match.backdrop_path, tmdbId: match.id },
        );
        updated += 1;
        console.log(`  ✓ ${movie.title} (${movie.year})`);
      } else {
        missing += 1;
        console.log(`  - ${movie.title} (${movie.year}): no poster found`);
      }
    } catch (error) {
      missing += 1;
      console.log(`  ✗ ${movie.title}: ${error.message}`);
      if (error.message.includes('401')) break;
    }
    await sleep(DELAY_MS);
  }
  console.log(`\nDone: ${updated} posters stored, ${missing} skipped.`);
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  try {
    await main();
  } catch (error) {
    console.error(`✗ TMDB sync failed: ${describeConnectionError(error)}`);
    process.exitCode = 1;
  } finally {
    await closeDriver();
  }
}
