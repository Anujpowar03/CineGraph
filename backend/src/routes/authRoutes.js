import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { loginRules, registerRules } from '../validators/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/register', authLimiter, registerRules, validate, asyncHandler(auth.register));
router.post('/login', authLimiter, loginRules, validate, asyncHandler(auth.login));
router.post('/logout', auth.logout);
router.get('/me', requireAuth, asyncHandler(auth.me));
router.get('/session', optionalAuth, asyncHandler(auth.session));

export default router;
