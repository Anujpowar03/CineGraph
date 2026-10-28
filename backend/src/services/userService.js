import { RECOMMENDATION_CONFIG } from '../config/recommendation.js';
import * as users from '../repositories/userRepository.js';
import { ApiError } from '../utils/ApiError.js';

/** Turns "no row returned" from a MATCH (u), (m) into a clear 404. */
function ensureFound(row, movieId) {
  if (!row) throw ApiError.notFound(`Movie "${movieId}" not found`);
  return row;
}

export async function likeMovie(userId, movieId) {
  return ensureFound(await users.likeMovie(userId, movieId), movieId);
}

export async function unlikeMovie(userId, movieId) {
  const removed = await users.unlikeMovie(userId, movieId);
  return { movieId, removed: removed > 0 };
}

export async function rateMovie(userId, movieId, rating) {
  return ensureFound(await users.rateMovie(userId, movieId, rating), movieId);
}

export async function deleteRating(userId, movieId) {
  const removed = await users.deleteRating(userId, movieId);
  return { movieId, removed: removed > 0 };
}

export async function watchMovie(userId, movieId) {
  return ensureFound(await users.watchMovie(userId, movieId), movieId);
}

export const getFavorites = (userId, limit) => users.getFavorites(userId, limit);
export const getHistory = (userId, limit) => users.getHistory(userId, limit);
export const getRatings = (userId, limit) => users.getRatings(userId, limit);
export const getPreferences = (userId) => users.getPreferences(userId);

export async function updatePreferences(userId, genreIds) {
  const unique = [...new Set(genreIds)];
  const existing = await users.findExistingGenreIds(unique);
  const unknown = unique.filter((id) => !existing.includes(id));
  if (unknown.length > 0) {
    throw ApiError.badRequest('Unknown genre ids', unknown.map((id) => ({ field: 'genreIds', message: `Unknown genre "${id}"` })));
  }
  await users.replacePreferences(userId, unique);
  return users.getPreferences(userId);
}

export async function getProfileSummary(userId) {
  const [user, stats, topGenres, preferences] = await Promise.all([
    users.findUserById(userId),
    users.getUserStats(userId),
    users.getTopGenres(userId, RECOMMENDATION_CONFIG.positiveRatingThreshold),
    users.getPreferences(userId),
  ]);
  if (!user) throw ApiError.notFound('User not found');
  return { user, stats, topGenres, preferences };
}
