import { matchedData } from 'express-validator';
import * as analytics from '../services/analyticsService.js';
import { sendSuccess } from '../utils/response.js';

export const overview = async (req, res) => sendSuccess(res, await analytics.overview());
export const genres = async (req, res) => sendSuccess(res, await analytics.genres());
export const topMovies = async (req, res) => sendSuccess(res, await analytics.topMovies(matchedData(req).limit));
export const ratingDistribution = async (req, res) => sendSuccess(res, await analytics.ratingDistribution());
export const people = async (req, res) => sendSuccess(res, await analytics.mostConnectedPeople(matchedData(req).limit));
export const decades = async (req, res) => sendSuccess(res, await analytics.moviesPerDecade());
