import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Authentication strategy
 * -----------------------
 * After login the API issues a signed JWT inside an httpOnly cookie. JavaScript
 * in the browser cannot read httpOnly cookies, which protects the token from
 * XSS theft. The token only contains the userId ("sub"); identity for every
 * protected operation is taken from this verified token, never from the request
 * body or URL.
 */

export function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
    algorithm: 'HS256',
  });
}

export function authCookieOptions() {
  const sameSite = env.cookie.sameSite;
  return {
    httpOnly: true,
    secure: env.isProduction || sameSite === 'none',
    sameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function readUserId(req) {
  const token = req.cookies?.[env.cookie.name];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.jwt.secret, { algorithms: ['HS256'] });
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Rejects the request with 401 unless a valid session cookie is present. */
export function requireAuth(req, res, next) {
  const userId = readUserId(req);
  if (!userId) return next(ApiError.unauthorized('Please sign in to continue'));
  req.auth = { userId };
  return next();
}

/** Attaches req.auth when a valid cookie exists, but never rejects. */
export function optionalAuth(req, res, next) {
  const userId = readUserId(req);
  req.auth = userId ? { userId } : null;
  next();
}

/**
 * Routes such as /api/users/:userId/likes keep the conventional REST shape,
 * but a user may only act on their own resources. ":userId" may be the literal
 * "me" or the caller's own id; anything else is rejected with 403.
 */
export function authorizeUserParam(req, res, next) {
  const requested = req.params.userId;
  if (requested === 'me' || requested === req.auth?.userId) {
    req.params.userId = req.auth.userId;
    return next();
  }
  return next(ApiError.forbidden('You can only access your own profile data'));
}
