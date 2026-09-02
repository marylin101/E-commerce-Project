const { ObjectId } = require('mongodb');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

function requireFields(obj, fields) {
  const missing = fields.filter((f) => obj[f] === undefined || obj[f] === null || obj[f] === '');
  if (missing.length > 0) throw new ValidationError(`Missing required field(s): ${missing.join(', ')}`);
}

function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

function requireValidObjectId(id, fieldName = 'id') {
  if (!isValidObjectId(id)) throw new ValidationError(`Invalid ${fieldName}: must be a valid ObjectId`);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function requireValidEmail(email) {
  if (!isValidEmail(email)) throw new ValidationError('Invalid email format');
}

function requireValidRole(role, allowedRoles) {
  if (!allowedRoles.includes(role)) throw new ValidationError(`Invalid role: must be one of ${allowedRoles.join(', ')}`);
}

function requireNonNegativeNumber(value, fieldName) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    throw new ValidationError(`${fieldName} must be a number >= 0`);
  }
}

function requireRatingInRange(rating) {
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    throw new ValidationError('Rating must be a number between 1 and 5');
  }
}

function requireValidStatus(status, allowedStatuses) {
  if (!allowedStatuses.includes(status)) throw new ValidationError(`Invalid status: must be one of ${allowedStatuses.join(', ')}`);
}

function handleDuplicateKeyError(err, friendlyFieldName = 'value') {
  if (err && err.code === 11000) throw new ValidationError(`${friendlyFieldName} already exists`);
  throw err;
}

module.exports = {
  ValidationError,
  requireFields,
  isValidObjectId,
  requireValidObjectId,
  isValidEmail,
  requireValidEmail,
  requireValidRole,
  requireNonNegativeNumber,
  requireRatingInRange,
  requireValidStatus,
  handleDuplicateKeyError,
};
