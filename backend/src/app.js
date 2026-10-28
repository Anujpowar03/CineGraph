import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { CLIENT_HEADER, requireClientHeader } from './middleware/csrf.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import apiRoutes from './routes/index.js';

/** Builds the Express application. Kept separate from server.js so tests can import it. */
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      // Only the configured front-end origin(s) may call the API with cookies.
      origin(origin, callback) {
        if (!origin || env.clientUrls.includes(origin)) return callback(null, true);
        return callback(null, false);
      },
      credentials: true,
      allowedHeaders: ['Content-Type', CLIENT_HEADER],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  );
  app.use(express.json({ limit: '20kb' }));
  app.use(cookieParser());
  if (!env.isTest) app.use(morgan(env.isProduction ? 'combined' : 'dev'));

  app.use('/api', apiLimiter, requireClientHeader, apiRoutes);

  app.get('/', (req, res) => {
    res.json({ success: true, data: { name: 'CineGraph API', docs: '/api/health' } });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
