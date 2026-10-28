import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/** Runs after express-validator chains and turns failures into a 400 response. */
export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const details = result.array().map((issue) => ({
    field: issue.path,
    location: issue.location,
    message: issue.msg,
  }));
  return next(ApiError.badRequest('Invalid request parameters', details));
}
