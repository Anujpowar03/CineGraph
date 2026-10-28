/**
 * Every successful response has the shape { success: true, data, meta? }.
 * Errors (see middleware/errorHandler.js) have { success: false, error: { code, message } }.
 */
export function sendSuccess(res, data, { status = 200, meta } = {}) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}
