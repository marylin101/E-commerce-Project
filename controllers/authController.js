/**
 * controllers/authController.js
 * ------------------------------------------------------------------
 * OWNER: Member 3 (Authentication, Security & Middleware)
 *
 * Thin controller: extract data, call the service, return a response.
 * All validation already happened in validateRequest middleware; all
 * error throwing is caught by the centralized errorHandler (both are
 * wired up in server.js / routes), so controllers stay simple.
 * ------------------------------------------------------------------
 */
const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });
    return sendSuccess(res, 201, result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return sendSuccess(res, 200, result);
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    // req.user is attached by authMiddleware after verifying the JWT.
    return sendSuccess(res, 200, { user: req.user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
