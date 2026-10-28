import { Router } from 'express';
import { health } from '../controllers/healthController.js';
import analyticsRoutes from './analyticsRoutes.js';
import authRoutes from './authRoutes.js';
import genreRoutes from './genreRoutes.js';
import graphRoutes from './graphRoutes.js';
import movieRoutes from './movieRoutes.js';
import recommendationRoutes from './recommendationRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.get('/health', health);
router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/genres', genreRoutes);
router.use('/users', userRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/graph', graphRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
