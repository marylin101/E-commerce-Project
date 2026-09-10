const bcrypt = require('bcrypt');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/jwt');
const userRepository = require('../repositories/userRepository');

const ALLOWED_ROLES = ['customer', 'admin'];

function toPublicUser(user) {
  // Never return the password hash to the client.
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

async function register({ name, email, password, role }) {
  const existing = await userRepository.findUserByEmail(email);
  if (existing) {
    throw ApiError.badRequest('An account with this email already exists.');
  }

  const finalRole = role && ALLOWED_ROLES.includes(role) ? role : 'customer';

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await userRepository.createUser({
    name,
    email,
    passwordHash,
    role: finalRole,
  });

  const token = signToken({ sub: user._id.toString(), role: user.role });

  return { user: toPublicUser(user), token };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    // Deliberately vague — don't reveal whether the email exists.
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const token = signToken({ sub: user._id.toString(), role: user.role });

  return { user: toPublicUser(user), token };
}

module.exports = { register, login, toPublicUser };
