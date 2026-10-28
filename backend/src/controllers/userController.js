import { matchedData } from 'express-validator';
import * as users from '../services/userService.js';
import { sendSuccess } from '../utils/response.js';

// req.params.userId has already been replaced by the authenticated user's id
// in middleware/auth.js (authorizeUserParam), so it is trustworthy here.

export async function getProfile(req, res) {
  sendSuccess(res, await users.getProfileSummary(req.params.userId));
}

export async function likeMovie(req, res) {
  sendSuccess(res, await users.likeMovie(req.params.userId, req.params.movieId), { status: 201 });
}

export async function unlikeMovie(req, res) {
  sendSuccess(res, await users.unlikeMovie(req.params.userId, req.params.movieId));
}

export async function rateMovie(req, res) {
  const { rating } = matchedData(req, { locations: ['body'] });
  sendSuccess(res, await users.rateMovie(req.params.userId, req.params.movieId, rating));
}

export async function deleteRating(req, res) {
  sendSuccess(res, await users.deleteRating(req.params.userId, req.params.movieId));
}

export async function watchMovie(req, res) {
  sendSuccess(res, await users.watchMovie(req.params.userId, req.params.movieId), { status: 201 });
}

export async function getFavorites(req, res) {
  sendSuccess(res, await users.getFavorites(req.params.userId, matchedData(req).limit));
}

export async function getHistory(req, res) {
  sendSuccess(res, await users.getHistory(req.params.userId, matchedData(req).limit));
}

export async function getRatings(req, res) {
  sendSuccess(res, await users.getRatings(req.params.userId, matchedData(req).limit));
}

export async function getPreferences(req, res) {
  sendSuccess(res, await users.getPreferences(req.params.userId));
}

export async function updatePreferences(req, res) {
  const { genreIds } = matchedData(req, { locations: ['body'] });
  sendSuccess(res, await users.updatePreferences(req.params.userId, genreIds));
}
