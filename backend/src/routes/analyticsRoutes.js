import { Router } from 'express';
import * as analytics from '../controllers/analyticsController.js';
import { validate } from '../middleware/validate.js';
import { simpleLimitRules } from '../validators/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/overview', asyncHandler(analytics.overview));
router.get('/genres', asyncHandler(analytics.genres));
router.get('/top-movies', simpleLimitRules(20, 10), validate, asyncHandler(analytics.topMovies));
router.get('/rating-distribution', asyncHandler(analytics.ratingDistribution));
router.get('/people', simpleLimitRules(20, 10), validate, asyncHandler(analytics.people));
router.get('/decades', asyncHandler(analytics.decades));

export default router;
