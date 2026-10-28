import { Router } from 'express';
import { recommend, similarUsers } from '../controllers/recommendationController.js';
import { authorizeUserParam, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { recommendationRules } from '../validators/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const own = [requireAuth, recommendationRules, validate, authorizeUserParam];

router.get('/:userId', own, asyncHandler(recommend('hybrid')));
router.get('/:userId/hybrid', own, asyncHandler(recommend('hybrid')));
router.get('/:userId/genre', own, asyncHandler(recommend('genre')));
router.get('/:userId/people', own, asyncHandler(recommend('people')));
router.get('/:userId/collaborative', own, asyncHandler(recommend('collaborative')));
router.get('/:userId/similar-users', own, asyncHandler(similarUsers));

export default router;
