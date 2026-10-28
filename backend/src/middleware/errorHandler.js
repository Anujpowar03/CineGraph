import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const DATABASE_DOWN_CODES = new Set(['ServiceUnavailable', 'SessionExpired']);

export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist`));
}

/**
 * Centralised error handler. Maps known errors to HTTP responses and never
 * leaks stack traces or database internals outside development.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Something went wrong. Please try again.';
  let details;

  if (err instanceof ApiError) {
    ({ status, code, message, details } = err);
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Request body is not valid JSON';
  } else if (err?.type === 'entity.too.large') {
    status = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request body is too large';
  } else if (DATABASE_DOWN_CODES.has(err?.code)) {
    status = 503;
    code = 'DATABASE_UNAVAILABLE';
    message = 'The graph database is currently unavailable. Please try again shortly.';
  } else if (err?.code === 'Neo.ClientError.Security.Unauthorized') {
    status = 503;
    code = 'DATABASE_UNAVAILABLE';
    message = 'The API could not authenticate with the graph database.';
  } else if (err?.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
    status = 409;
    code = 'CONFLICT';
    message = 'This record already exists.';
  }

  if (status >= 500 && !env.isTest) {
    console.error(`[error] ${req.method} ${req.originalUrl}:`, err);
  }

  const body = { success: false, error: { code, message } };
  if (details) body.error.details = details;
  if (!env.isProduction && !env.isTest && status >= 500 && err?.message) {
    body.error.debug = err.message;
  }
  res.status(status).json(body);
}
