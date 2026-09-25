/**
 * utils/apiResponse.js
 * ------------------------------------------------------------------
 * OWNER: Member 3 (contributes the shared shape); used by everyone.
 *
 * Guarantees every successful response matches the format promised in
 * the Milestone 1 report:
 *   { "success": true, "data": {...}, "error": null }
 * ------------------------------------------------------------------
 */
function sendSuccess(res, arg2, arg3) {
  let statusCode = 200;
  let data = null;

  if (typeof arg2 === 'number') {
    statusCode = arg2;
    data = arg3;
  } else {
    data = arg2;
    if (typeof arg3 === 'number') {
      statusCode = arg3;
    }
  }

  return res.status(statusCode).json({
    success: true,
    data,
    error: null,
  });
}

module.exports = { sendSuccess, sucResponse: sendSuccess };

