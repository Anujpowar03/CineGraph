import { matchedData } from 'express-validator';
import * as movies from '../services/movieService.js';
import { sendSuccess } from '../utils/response.js';

export async function listMovies(req, res) {
  const q = matchedData(req, { locations: ['query'] });
  const filters = {
    q: q.q || null,
    genres: q.genre || [],
    yearFrom: q.yearFrom,
    yearTo: q.yearTo,
    minRating: q.minRating,
    sort: q.sort || 'rating',
    order: q.order || (q.sort === 'title' ? 'asc' : 'desc'),
    page: q.page || 1,
    limit: q.limit,
  };
  const { items, meta } = await movies.listMovies(filters);
  sendSuccess(res, items, { meta: { ...meta, filters } });
}

export async function searchMovies(req, res) {
  const { q, limit } = matchedData(req);
  sendSuccess(res, await movies.searchMovies(q, limit));
}

export async function trendingMovies(req, res) {
  const { limit } = matchedData(req);
  sendSuccess(res, await movies.trendingMovies(limit));
}

export async function getMovie(req, res) {
  sendSuccess(res, await movies.getMovieDetails(req.params.movieId, req.auth?.userId));
}

export async function getRelatedMovies(req, res) {
  const { movieId, limit } = matchedData(req);
  sendSuccess(res, await movies.getRelatedMovies(movieId, limit));
}

export async function listGenres(req, res) {
  sendSuccess(res, await movies.listGenres());
}

export async function catalogueMeta(req, res) {
  const [genres, years] = await Promise.all([movies.listGenres(), movies.yearRange()]);
  sendSuccess(res, { genres, years });
}
