import { Router } from 'express';
import { movieGraph, neighbourhood } from '../controllers/graphController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { movieGraphRules, neighbourhoodRules } from '../validators/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/movie/:movieId', optionalAuth, movieGraphRules, validate, asyncHandler(movieGraph));
router.get('/neighborhood/:type/:id', optionalAuth, neighbourhoodRules, validate, asyncHandler(neighbourhood));

export default router;
