/**
 * middleware/roleMiddleware.js
 * ------------------------------------------------------------------
 * OWNER: Member 3 (Authentication, Security & Middleware)
 *
 * Must run AFTER authMiddleware, since it relies on req.user.role.
 *
 * requireAdmin protects admin-only endpoints, e.g.:
 *   router.post('/products', authMiddleware, requireAdmin, productController.create);
 *
 * requireRole('customer') is a generalised version for any future role.
 * ------------------------------------------------------------------
 */
const ApiError = require('../utils/ApiError');

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action.'));
    }
    next();
  };
}

const requireAdmin = requireRole('admin');

module.exports = { requireRole, requireAdmin };
