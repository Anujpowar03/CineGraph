import { readQuery } from '../config/neo4j.js';
import {
  ACTOR_CANDIDATES,
  COLLABORATIVE_CANDIDATES,
  DIRECTOR_CANDIDATES,
  GENRE_CANDIDATES,
  GENRE_NAMES,
  MOVIES_BY_IDS,
  POPULAR_FALLBACK,
  SIMILAR_USERS,
  USER_TASTE_PROFILE,
} from '../queries/recommendationQueries.js';

export async function getTasteProfile(userId, minPositiveRating) {
  const [row] = await readQuery(USER_TASTE_PROFILE, { userId, minPositiveRating });
  return row ?? null;
}

export async function getGenreNames(genreIds) {
  if (genreIds.length === 0) return new Map();
  const rows = await readQuery(GENRE_NAMES, { genreIds });
  return new Map(rows.map((r) => [r.genreId, r.name]));
}

export function getGenreCandidates({ genreWeights, excludeIds, seedIds, candidateLimit }) {
  return readQuery(GENRE_CANDIDATES, { genreWeights, excludeIds, seedIds, candidateLimit });
}

export function getActorCandidates({ seeds, excludeIds, candidateLimit }) {
  return readQuery(ACTOR_CANDIDATES, { seeds, excludeIds, candidateLimit });
}

export function getDirectorCandidates({ seeds, excludeIds, candidateLimit }) {
  return readQuery(DIRECTOR_CANDIDATES, { seeds, excludeIds, candidateLimit });
}

export function getSimilarUsers({ userId, seeds, minPositiveRating, minSharedMovies, maxSimilarUsers }) {
  return readQuery(SIMILAR_USERS, { userId, seeds, minPositiveRating, minSharedMovies, maxSimilarUsers });
}

export function getCollaborativeCandidates({ neighbours, totalSimilarity, excludeIds, minPositiveRating, candidateLimit }) {
  return readQuery(COLLABORATIVE_CANDIDATES, {
    neighbours,
    totalSimilarity,
    excludeIds,
    minPositiveRating,
    candidateLimit,
  });
}

export async function getMoviesByIds(movieIds) {
  if (movieIds.length === 0) return new Map();
  const rows = await readQuery(MOVIES_BY_IDS, { movieIds });
  return new Map(rows.map((r) => [r.movie.movieId, r.movie]));
}

export function getPopularMovies(userId, excludeIds, limit) {
  return readQuery(POPULAR_FALLBACK, { userId, excludeIds, limit });
}
