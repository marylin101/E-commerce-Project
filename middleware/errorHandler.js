/**
 * middleware/errorHandler.js
 * ------------------------------------------------------------------
 * OWNER: Member 3 (Authentication, Security & Middleware)
 *
 * Centralized error handler. Every controller calls next(err) instead
 * of building its own error response; this is the single place that
 * decides the HTTP status code and the shape of the error response,
 * matching the format promised in the Milestone 1 report:
 *
 *   { "success": false, "data": null, "error": { "message": "..." } }
 *
 * IMPORTANT: must be registered LAST, after all routes, in server.js.
 * ------------------------------------------------------------------
 */
const ApiError = require('../utils/ApiError');
const { ValidationError } = require('../utils/validators');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Known, expected errors (thrown deliberately via ApiError.*)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      message: err.message,
      error: {
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // MongoDB duplicate key error (e.g. duplicate email/SKU) -> 400
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      data: null,
      error: { message: 'A record with this value already exists.' },
    });
  }

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      error: { message: err.message },
    });
  }

  // Anything unexpected -> 500, log it server-side but don't leak details.
  console.error('[unhandled error]', err);
  return res.status(500).json({
    success: false,
    data: null,
    error: { message: 'Internal server error.' },
  });
}

module.exports = errorHandler;
