import { Router } from 'express';
import { listGenres } from '../controllers/movieController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(listGenres));

export default router;
