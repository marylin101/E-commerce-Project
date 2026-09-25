/**
 * middleware/validateRequest.js
 * ------------------------------------------------------------------
 * OWNER: Member 3 (Authentication, Security & Middleware)
 *
 * Generic validation middleware. Takes a "validator function" (see
 * validators/*.js) that inspects req.body and returns an array of
 * human-readable error strings (empty array = valid), and turns any
 * errors into a 400 response with the standard error envelope.
 *
 * Usage:
 *   const { validateRegister } = require('../validators/authValidators');
 *   router.post('/register', validateRequest(validateRegister), authController.register);
 * ------------------------------------------------------------------
 */
function validateRequest(validatorFn) {
  return (req, res, next) => {
    const errors = validatorFn(req.body || {});
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          message: 'Validation failed.',
          details: errors,
        },
      });
    }
    next();
  };
}

module.exports = validateRequest;
