import { Router } from 'express';
import * as movies from '../controllers/movieController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listMoviesRules, movieIdParam, relatedRules, searchRules, simpleLimitRules } from '../validators/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Static paths are declared before "/:movieId" so they are not treated as ids.
router.get('/', listMoviesRules, validate, asyncHandler(movies.listMovies));
router.get('/search', searchRules, validate, asyncHandler(movies.searchMovies));
router.get('/trending', simpleLimitRules(24, 10), validate, asyncHandler(movies.trendingMovies));
router.get('/meta', asyncHandler(movies.catalogueMeta));
router.get('/:movieId', optionalAuth, movieIdParam, validate, asyncHandler(movies.getMovie));
router.get('/:movieId/related', relatedRules, validate, asyncHandler(movies.getRelatedMovies));

export default router;
