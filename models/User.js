const ROLES = ['customer', 'admin'];

function buildUserDocument({ name, email, passwordHash, role = 'customer' }) {
  return { name, email, passwordHash, role, createdAt: new Date() };
}

module.exports = { ROLES, buildUserDocument };
