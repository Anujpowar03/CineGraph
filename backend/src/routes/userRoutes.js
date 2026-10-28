import { Router } from 'express';
import * as users from '../controllers/userController.js';
import { authorizeUserParam, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  preferencesRules,
  ratingRules,
  userIdParam,
  userListRules,
  userMovieRules,
} from '../validators/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * All routes require a signed-in user and only operate on that user's data.
 * Use "me" as :userId (e.g. POST /api/users/me/likes/inception-2010).
 */
const router = Router({ mergeParams: true });
const own = [requireAuth, userIdParam, validate, authorizeUserParam];

router.get('/:userId/profile', own, asyncHandler(users.getProfile));

router.post('/:userId/likes/:movieId', own, userMovieRules, validate, asyncHandler(users.likeMovie));
router.delete('/:userId/likes/:movieId', own, userMovieRules, validate, asyncHandler(users.unlikeMovie));

router.post('/:userId/ratings/:movieId', own, ratingRules, validate, asyncHandler(users.rateMovie));
router.put('/:userId/ratings/:movieId', own, ratingRules, validate, asyncHandler(users.rateMovie));
router.delete('/:userId/ratings/:movieId', own, userMovieRules, validate, asyncHandler(users.deleteRating));

router.post('/:userId/watch-history/:movieId', own, userMovieRules, validate, asyncHandler(users.watchMovie));

router.get('/:userId/favorites', own, userListRules, validate, asyncHandler(users.getFavorites));
router.get('/:userId/history', own, userListRules, validate, asyncHandler(users.getHistory));
router.get('/:userId/ratings', own, userListRules, validate, asyncHandler(users.getRatings));

router.get('/:userId/preferences', own, asyncHandler(users.getPreferences));
router.put('/:userId/preferences', own, preferencesRules, validate, asyncHandler(users.updatePreferences));

export default router;
