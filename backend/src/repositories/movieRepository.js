import { readQuery } from '../config/neo4j.js';
import {
  LIST_GENRES,
  MOVIE_DETAILS,
  MOVIE_EXISTS,
  MOVIE_SORTS,
  RELATED_MOVIES,
  SEARCH_MOVIES,
  TRENDING_MOVIES,
  USER_MOVIE_STATE,
  YEAR_RANGE,
  listMoviesQuery,
} from '../queries/movieQueries.js';

export async function listMovies({ q, genres, yearFrom, yearTo, minRating, sort, order, page, limit }) {
  const orderBy = MOVIE_SORTS[sort][order];
  const [row] = await readQuery(listMoviesQuery(orderBy), {
    q: q || null,
    genres: genres || [],
    yearFrom: yearFrom ?? null,
    yearTo: yearTo ?? null,
    minRating: minRating ?? null,
    skip: (page - 1) * limit,
    limit,
  });
  return { total: row?.total ?? 0, items: row?.items ?? [] };
}

export async function searchMovies(q, limit) {
  const rows = await readQuery(SEARCH_MOVIES, { q, limit });
  return rows.map((r) => r.movie);
}

export async function trendingMovies(limit) {
  const rows = await readQuery(TRENDING_MOVIES, { limit });
  return rows.map((r) => ({ ...r.movie, engagedUsers: r.engagedUsers }));
}

export async function findMovieDetails(movieId) {
  const [row] = await readQuery(MOVIE_DETAILS, { movieId });
  return row?.movie ?? null;
}

export async function findUserMovieState(userId, movieId) {
  const [row] = await readQuery(USER_MOVIE_STATE, { userId, movieId });
  return row ?? null;
}

export async function movieExists(movieId) {
  const rows = await readQuery(MOVIE_EXISTS, { movieId });
  return rows.length > 0;
}

export function findRelatedCandidates(movieId, candidateLimit) {
  return readQuery(RELATED_MOVIES, { movieId, candidateLimit });
}

export async function listGenres() {
  const rows = await readQuery(LIST_GENRES);
  return rows.map((r) => r.genre);
}

export async function yearRange() {
  const [row] = await readQuery(YEAR_RANGE);
  return row;
}
