import { ApiError } from '../utils/ApiError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
export const CLIENT_HEADER = 'x-cinegraph-client';

/**
 * Lightweight CSRF defence for cookie-based auth. A cross-site HTML form cannot
 * attach custom headers, and a cross-site fetch() that tries to would trigger a
 * CORS pre-flight that our restricted CORS policy refuses. So requiring this
 * header on every state-changing request blocks forged requests.
 */
export function requireClientHeader(req, res, next) {
  if (SAFE_METHODS.has(req.method) || req.get(CLIENT_HEADER)) return next();
  return next(ApiError.forbidden(`Missing ${CLIENT_HEADER} header`));
}
