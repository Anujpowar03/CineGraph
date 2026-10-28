import { readQuery, writeQuery } from '../config/neo4j.js';
import {
  CREATE_USER,
  DELETE_RATING,
  EXISTING_GENRES,
  FIND_USER_BY_ID,
  FIND_USER_CREDENTIALS,
  LIKE_MOVIE,
  RATE_MOVIE,
  REPLACE_PREFERENCES,
  UNLIKE_MOVIE,
  USER_FAVORITES,
  USER_HISTORY,
  USER_PREFERENCES,
  USER_RATINGS,
  USER_STATS,
  USER_TOP_GENRES,
  WATCH_MOVIE,
} from '../queries/userQueries.js';

export async function createUser(user) {
  const [row] = await writeQuery(CREATE_USER, user);
  return row.user;
}

export async function findCredentialsByEmail(email) {
  const [row] = await readQuery(FIND_USER_CREDENTIALS, { email });
  return row ?? null;
}

export async function findUserById(userId) {
  const [row] = await readQuery(FIND_USER_BY_ID, { userId });
  return row?.user ?? null;
}

export async function getUserStats(userId) {
  const [row] = await readQuery(USER_STATS, { userId });
  return row ?? null;
}

export async function getTopGenres(userId, minPositiveRating, limit = 5) {
  return readQuery(USER_TOP_GENRES, { userId, minPositiveRating, limit });
}

export async function likeMovie(userId, movieId) {
  const [row] = await writeQuery(LIKE_MOVIE, { userId, movieId });
  return row ?? null;
}

export async function unlikeMovie(userId, movieId) {
  const [row] = await writeQuery(UNLIKE_MOVIE, { userId, movieId });
  return row?.removed ?? 0;
}

export async function rateMovie(userId, movieId, rating) {
  const [row] = await writeQuery(RATE_MOVIE, { userId, movieId, rating });
  return row ?? null;
}

export async function deleteRating(userId, movieId) {
  const [row] = await writeQuery(DELETE_RATING, { userId, movieId });
  return row?.removed ?? 0;
}

export async function watchMovie(userId, movieId) {
  const [row] = await writeQuery(WATCH_MOVIE, { userId, movieId });
  return row ?? null;
}

export async function getFavorites(userId, limit) {
  const rows = await readQuery(USER_FAVORITES, { userId, limit });
  return rows.map((r) => ({ ...r.movie, likedAt: r.likedAt }));
}

export async function getHistory(userId, limit) {
  const rows = await readQuery(USER_HISTORY, { userId, limit });
  return rows.map((r) => ({ ...r.movie, watchedAt: r.watchedAt, watchCount: r.watchCount }));
}

export async function getRatings(userId, limit) {
  const rows = await readQuery(USER_RATINGS, { userId, limit });
  return rows.map((r) => ({ ...r.movie, userRating: r.rating, ratedAt: r.ratedAt }));
}

export async function getPreferences(userId) {
  const rows = await readQuery(USER_PREFERENCES, { userId });
  return rows.map((r) => r.genre);
}

export async function findExistingGenreIds(genreIds) {
  const rows = await readQuery(EXISTING_GENRES, { genreIds });
  return rows.map((r) => r.genreId);
}

export async function replacePreferences(userId, genreIds) {
  await writeQuery(REPLACE_PREFERENCES, { userId, genreIds });
}
