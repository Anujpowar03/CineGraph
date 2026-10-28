import { RECOMMENDATION_CONFIG } from '../config/recommendation.js';
import * as movies from '../repositories/movieRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { joinNames } from './explanations.js';
import { relatedScore, round } from './scoring.js';

const sortGenres = (movie) => ({ ...movie, genres: [...(movie.genres || [])].sort() });

export async function listMovies(filters) {
  const { total, items } = await movies.listMovies(filters);
  return {
    items: items.map(sortGenres),
    meta: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
      hasMore: filters.page * filters.limit < total,
    },
  };
}

export async function searchMovies(q, limit) {
  return (await movies.searchMovies(q, limit)).map(sortGenres);
}

export async function trendingMovies(limit) {
  return (await movies.trendingMovies(limit)).map(sortGenres);
}

export async function getMovieDetails(movieId, viewerId) {
  const movie = await movies.findMovieDetails(movieId);
  if (!movie) throw ApiError.notFound(`Movie "${movieId}" not found`);
  movie.genres.sort((a, b) => a.name.localeCompare(b.name));
  movie.communityRating = movie.communityRating === null ? null : round(movie.communityRating, 2);
  const userState = viewerId ? await movies.findUserMovieState(viewerId, movieId) : null;
  return { ...movie, userState };
}

/**
 * Related movies with an explanation of every shared node.
 * Scoring is documented in services/scoring.js (relatedScore).
 */
export async function getRelatedMovies(movieId, limit) {
  if (!(await movies.movieExists(movieId))) throw ApiError.notFound(`Movie "${movieId}" not found`);
  const rows = await movies.findRelatedCandidates(movieId, RECOMMENDATION_CONFIG.related.candidateLimit);
  return rows
    .map((row) => {
      const { score, parts } = relatedScore({
        sharedGenres: row.sharedGenres.length,
        sharedActors: row.sharedActors.length,
        sharedDirectors: row.sharedDirectors.length,
        sourceGenreCount: row.sourceGenreCount,
        candidateGenreCount: row.candidateGenreCount,
        coLikedBy: row.coLikedBy,
      });
      const reasons = [];
      if (row.sharedDirectors.length) reasons.push(`Same director: ${joinNames(row.sharedDirectors)}`);
      if (row.sharedActors.length) reasons.push(`Shared cast: ${joinNames(row.sharedActors)}`);
      if (row.sharedGenres.length) reasons.push(`Shared genres: ${joinNames([...row.sharedGenres].sort())}`);
      if (row.coLikedBy > 0) reasons.push(`${row.coLikedBy} user${row.coLikedBy === 1 ? '' : 's'} liked both movies`);
      return {
        ...sortGenres(row.movie),
        relatedScore: round(score),
        scoreParts: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, round(v)])),
        sharedGenres: [...row.sharedGenres].sort(),
        sharedActors: row.sharedActors,
        sharedDirectors: row.sharedDirectors,
        coLikedBy: row.coLikedBy,
        reasons,
      };
    })
    .sort((a, b) => b.relatedScore - a.relatedScore || b.rating - a.rating || a.title.localeCompare(b.title))
    .slice(0, limit);
}

export const listGenres = () => movies.listGenres();
export const yearRange = () => movies.yearRange();
