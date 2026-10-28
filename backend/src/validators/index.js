import { body, param, query } from 'express-validator';
import { MOVIE_SORTS } from '../queries/movieQueries.js';
import { RECOMMENDATION_CONFIG } from '../config/recommendation.js';

/** Ids are lower-case slugs ("inception-2010") or UUIDs - nothing else is accepted. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const USER_ID = /^(me|[A-Za-z0-9-]{1,64})$/;

const toList = (value) => {
  if (value === undefined || value === '') return [];
  const raw = Array.isArray(value) ? value : String(value).split(',');
  return raw.map((v) => String(v).trim().toLowerCase()).filter(Boolean);
};

export const movieIdParam = param('movieId')
  .isString()
  .isLength({ min: 1, max: 120 })
  .matches(SLUG)
  .withMessage('movieId must be a lower-case slug such as "inception-2010"');

export const userIdParam = param('userId').matches(USER_ID).withMessage('Invalid userId');

// default() runs first so a missing value is replaced before validation.
const limitQuery = (max, fallback) =>
  query('limit').default(fallback).isInt({ min: 1, max }).withMessage(`limit must be between 1 and ${max}`).toInt();

export const listMoviesRules = [
  query('q').optional().isString().trim().isLength({ max: 100 }).withMessage('q must be at most 100 characters'),
  query('genre')
    .optional()
    .customSanitizer(toList)
    .custom((list) => list.length <= 15 && list.every((g) => SLUG.test(g)))
    .withMessage('genre must be a comma-separated list of genre ids'),
  query('yearFrom').optional().isInt({ min: 1870, max: 2100 }).withMessage('yearFrom must be a valid year').toInt(),
  query('yearTo').optional().isInt({ min: 1870, max: 2100 }).withMessage('yearTo must be a valid year').toInt(),
  query('minRating').optional().isFloat({ min: 0, max: 10 }).withMessage('minRating must be between 0 and 10').toFloat(),
  query('sort').optional().isIn(Object.keys(MOVIE_SORTS)).withMessage(`sort must be one of: ${Object.keys(MOVIE_SORTS).join(', ')}`),
  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
  query('page').optional().isInt({ min: 1, max: 1000 }).withMessage('page must be a positive integer').toInt(),
  limitQuery(48, 12),
  query('yearTo').custom((yearTo, { req }) => {
    if (yearTo !== undefined && req.query.yearFrom !== undefined && Number(yearTo) < Number(req.query.yearFrom)) {
      throw new Error('yearTo must be greater than or equal to yearFrom');
    }
    return true;
  }),
];

export const searchRules = [
  query('q').isString().trim().isLength({ min: 1, max: 100 }).withMessage('q is required (1-100 characters)'),
  limitQuery(20, 8),
];

export const simpleLimitRules = (max = 24, fallback = 10) => [limitQuery(max, fallback)];

export const relatedRules = [movieIdParam, limitQuery(24, 8)];

export const ratingRules = [
  userIdParam,
  movieIdParam,
  body('rating')
    .exists({ values: 'null' })
    .withMessage('rating is required')
    .bail()
    .isInt({ min: 1, max: 5 })
    .withMessage('rating must be a whole number from 1 to 5')
    .toInt(),
];

export const userMovieRules = [userIdParam, movieIdParam];

export const userListRules = [userIdParam, limitQuery(100, 50)];

export const preferencesRules = [
  userIdParam,
  body('genreIds').isArray({ max: 15 }).withMessage('genreIds must be an array of at most 15 genre ids'),
  body('genreIds.*').isString().matches(SLUG).withMessage('Each genre id must be a slug such as "sci-fi"'),
];

export const registerRules = [
  body('name').isString().trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  body('email').isString().trim().isEmail().withMessage('A valid email address is required').isLength({ max: 254 }),
  body('password')
    .isString()
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be 8-72 characters')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain a letter')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
];

export const loginRules = [
  body('email').isString().trim().isEmail().withMessage('A valid email address is required'),
  body('password').isString().isLength({ min: 1, max: 72 }).withMessage('Password is required'),
];

export const recommendationRules = [
  userIdParam,
  limitQuery(RECOMMENDATION_CONFIG.maxLimit, RECOMMENDATION_CONFIG.defaultLimit),
];

export const movieGraphRules = [
  movieIdParam,
  query('relatedLimit').default(8).isInt({ min: 0, max: 20 }).withMessage('relatedLimit must be 0-20').toInt(),
  query('userLimit').default(4).isInt({ min: 0, max: 10 }).withMessage('userLimit must be 0-10').toInt(),
];

export const neighbourhoodRules = [
  param('type').isIn(['movie', 'genre', 'actor', 'director', 'user']).withMessage('Unknown node type'),
  param('id').matches(USER_ID).withMessage('Invalid node id'),
  query('offset').default(0).isInt({ min: 0, max: 5000 }).withMessage('offset must be 0-5000').toInt(),
  limitQuery(50, 15),
];
