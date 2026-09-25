/**
 * utils/jwt.js
 * ------------------------------------------------------------------
 * OWNER: Member 3 (Authentication, Security & Middleware)
 *
 * Wraps jsonwebtoken so the sign/verify logic lives in one place.
 * The secret and expiry come from environment variables — never
 * hard-code the JWT secret in source control.
 * ------------------------------------------------------------------
 */
const jwt = require('jsonwebtoken');

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Check your .env file.');
  }
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Check your .env file.');
  }
  // Throws JsonWebTokenError / TokenExpiredError on failure — caller handles it.
  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };
