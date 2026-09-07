const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Known, expected errors (thrown deliberately via ApiError.*)
  if (err instanceof ApiError|| err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
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

  // Anything unexpected -> 500, log it server-side but don't leak details.
  console.error('[unhandled error]', err);
  return res.status(500).json({
    success: false,
    data: null,
    error: { message: 'Internal server error.' },
  });
}

module.exports = errorHandler;