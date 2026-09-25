const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { ROLES, buildUserDocument } = require('../models/User');
const {
  requireFields,
  requireValidEmail,
  requireValidObjectId,
  requireValidRole,
  handleDuplicateKeyError,
} = require('../utils/validators');

function collection() {
  return getDb().collection('users');
}

// expects passwordHash to already be hashed (bcrypt) by the caller
async function createUser({ name, email, passwordHash, role }) {
  requireFields({ name, email, passwordHash }, ['name', 'email', 'passwordHash']);
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
  requireValidEmail(cleanEmail);
  requireValidRole(role || 'customer', ROLES);

  const doc = buildUserDocument({ name, email: cleanEmail, passwordHash, role });

  try {
    const result = await collection().insertOne(doc);
    return { _id: result.insertedId, ...doc };
  } catch (err) {
    handleDuplicateKeyError(err, 'Email');
  }
}

async function findUserById(id) {
  requireValidObjectId(id, 'userId');
  return collection().findOne({ _id: new ObjectId(id) });
}

async function findUserByEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const cleanEmail = email.trim().toLowerCase();
  requireValidEmail(cleanEmail);
  let user = await collection().findOne({ email: cleanEmail });
  if (!user) {
    const escaped = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    user = await collection().findOne({ email: new RegExp(`^${escaped}$`, 'i') });
  }
  return user;
}

async function updateUser(id, updates) {
  requireValidObjectId(id, 'userId');
  if (updates.email) requireValidEmail(updates.email);
  if (updates.role) requireValidRole(updates.role, ROLES);

  try {
    return await collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
  } catch (err) {
    handleDuplicateKeyError(err, 'Email');
  }
}

async function deleteUser(id) {
  requireValidObjectId(id, 'userId');
  const result = await collection().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

module.exports = {createUser, findUserById, findUserByEmail, updateUser, deleteUser, findById: findUserById, findByEmail: findUserByEmail,};
