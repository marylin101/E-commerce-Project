const { verifyToken } = require('../utils/jwt');
const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing or malformed Authorization header.');
    }

    const token = header.split(' ')[1];

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Session expired. Please log in again.');
      }
      throw ApiError.unauthorized('Invalid token.');
    }

    const user = await userRepository.findUserById(decoded.sub);
    if (!user) {
      throw ApiError.unauthorized('User account no longer exists.');
    }

    // Attach a minimal, safe user object for downstream handlers.
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
